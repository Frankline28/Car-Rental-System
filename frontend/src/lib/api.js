/**
 * API boundary. Backend DTOs and enum values are translated here so application
 * code speaks one predictable contract. Mock mode remains selectable separately.
 */
import { mock } from './mock';
import { session } from './session';

export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';
const BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api').replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(message, status, path) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.path = path;
  }
}

const lower = (value) => (typeof value === 'string' ? value.toLowerCase() : value);
const upper = (value) => (typeof value === 'string' ? value.toUpperCase() : value);
const mapUser = (user) => user && ({ ...user, role: lower(user.role), status: lower(user.status) });
const mapUsers = (rows) => (Array.isArray(rows) ? rows.map(mapUser) : rows);
const mapBooking = (booking) => booking && ({ ...booking, paymentMethod: upper(booking.paymentMethod) });
const mapBookings = (rows) => (Array.isArray(rows) ? rows.map(mapBooking) : rows);

async function request(path, { method = 'GET', body, params } = {}) {
  const qs = params
    ? '?' + new URLSearchParams(Object.entries(params).filter(([, value]) => value !== '' && value != null)).toString()
    : '';
  const upperMethod = method.toUpperCase();
  const publicRead = upperMethod === 'GET' && /^\/(cars|packages|locations)(\/|$)/.test(path);
  const publicRequest = path.startsWith('/auth/') || publicRead;
  const storedToken = publicRequest ? null : session.token();
  const token = storedToken && !storedToken.startsWith('mock.') ? storedToken : null;
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${BASE}${path}${qs}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('Cannot reach the rental service. Check that the backend is running.', 0, path);
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && !publicRequest) {
      session.clear();
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('crs:unauthorized'));
    }
    const message = response.status === 409 && path.startsWith('/bookings')
      ? 'This car is no longer available for the selected dates. Choose another time or car.'
      : data?.message || data?.error || `Request failed (${response.status})`;
    throw new ApiError(message, response.status, data?.path || path);
  }
  return data?.data ?? data;
}

const carRequest = (car) => ({
  make: car.make,
  model: car.model,
  year: Number(car.year),
  type: car.type,
  transmission: car.transmission,
  fuel: car.fuel,
  seats: car.seats == null ? null : Number(car.seats),
  dailyRate: Number(car.dailyRate),
  hourlyRate: car.hourlyRate == null || car.hourlyRate === '' ? null : Number(car.hourlyRate),
  weeklyRate: car.weeklyRate == null || car.weeklyRate === '' ? null : Number(car.weeklyRate),
  monthlyRate: car.monthlyRate == null || car.monthlyRate === '' ? null : Number(car.monthlyRate),
  quantity: Number(car.quantity),
  location: car.location,
  image: car.image || null,
  features: Array.isArray(car.features) ? car.features : [],
  specifications: car.specifications || null,
  available: Boolean(car.available),
});

const packageRequest = (pkg) => ({
  name: pkg.name,
  unit: upper(pkg.unit),
  hours: Number(pkg.hours),
  discount: Number(pkg.discount),
  description: pkg.description || '',
});

const userRequest = (user) => ({
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  status: user.status ? upper(user.status) : null,
});

const bookingRequest = (booking) => ({
  carId: Number(booking.carId),
  packageId: String(booking.packageId),
  quantity: Number(booking.quantity),
  startDate: booking.startDate,
  endDate: booking.endDate,
  pickupLocation: booking.pickupLocation,
  paymentMethod: upper(booking.paymentMethod),
});

const real = {
  login: (body) => request('/auth/login', { method: 'POST', body }),
  register: (body) => request('/auth/register', { method: 'POST', body: { name: body.name, email: body.email, password: body.password, phone: body.phone || '' } }),

  getCars: (params) => request('/cars', { params }),
  getCar: (id) => request(`/cars/${id}`),
  createCar: (body) => request('/cars', { method: 'POST', body: carRequest(body) }),
  updateCar: (id, body) => request(`/cars/${id}`, { method: 'PUT', body: carRequest(body) }),
  deleteCar: (id) => request(`/cars/${id}`, { method: 'DELETE' }),

  getPackages: () => request('/packages'),
  getPackage: (id) => request(`/packages/${id}`),
  createPackage: (body) => request('/packages', { method: 'POST', body: packageRequest(body) }),
  updatePackage: (id, body) => request(`/packages/${id}`, { method: 'PUT', body: packageRequest(body) }),
  deletePackage: (id) => request(`/packages/${id}`, { method: 'DELETE' }),

  getLocations: () => request('/locations'),

  getMyBookings: async () => mapBookings(await request('/bookings/my')),
  getAllBookings: async () => mapBookings(await request('/bookings')),
  getBooking: async (id) => mapBooking(await request(`/bookings/${id}`)),
  createBooking: async (body) => mapBooking(await request('/bookings', { method: 'POST', body: bookingRequest(body) })),
  updateBooking: async (id, body) => mapBooking(await request(`/bookings/${id}`, { method: 'PUT', body: bookingRequest(body) })),
  cancelBooking: async (id) => mapBooking(await request(`/bookings/${id}/cancel`, { method: 'PATCH' })),

  getUsers: async () => mapUsers(await request('/users')),
  getUser: async (id) => mapUser(await request(`/users/${id}`)),
  updateUser: async (id, body) => mapUser(await request(`/users/${id}`, { method: 'PUT', body: userRequest(body) })),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),
};

export const api = USE_MOCK ? mock : real;
