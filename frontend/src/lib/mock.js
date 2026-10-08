/**
 * Demo backend that lives in the browser (localStorage). It mirrors the shape of ./api.js,
 * so the UI behaves the same with or without a real server.
 * Demo logins:  admin@carrental.com / admin123   and   customer@carrental.com / customer123
 */
import { session } from './session';
import { unitPrice } from './format';
import { TYPE_COLORS } from './constants';

const KEY = 'crs_mock_db_v1';
let memory = null;

const day = 86400000;
const iso = (t) => new Date(t).toISOString();

function seed() {
  const car = (id, make, model, year, type, dailyRate, seats, transmission, fuel, location, quantity, mileage, luggage, engine, features, description, image = null) => ({
    id, make, model, year, type, dailyRate, seats, transmission, fuel, location, quantity,
    available: true, color: TYPE_COLORS[type], mileage, luggage, engine, features, description,
    image,
  });
  const cars = [
    car('c1', 'Maruti Suzuki', 'Swift', 2024, 'Hatchback', 1800, 5, 'Manual', 'Petrol', 'Chennai', 4, '22 km/l', '2 bags', '1197 cc', ['Bluetooth audio', 'Dual airbags', 'ABS', 'Rear parking sensors'], 'Easy to park, easy on fuel. A good pick for city errands and short trips.', '/swift.avif'),
    car('c2', 'Hyundai', 'i20', 2024, 'Hatchback', 2000, 5, 'Automatic', 'Petrol', 'Bengaluru', 3, '20 km/l', '2 bags', '1197 cc', ['Sunroof', 'Apple CarPlay', 'Reverse camera', 'Cruise control'], 'A comfortable automatic hatchback with a sunroof and a quiet cabin.', '/i20.webp'),
    car('c3', 'Honda', 'City', 2023, 'Sedan', 2600, 5, 'Automatic', 'Petrol', 'Chennai', 3, '18 km/l', '3 bags', '1498 cc', ['Leather seats', 'Sunroof', 'Reverse camera', '6 airbags'], 'A roomy sedan that stays steady on highways. Good for family trips.', '/city.avif'),
    car('c4', 'Hyundai', 'Verna', 2024, 'Sedan', 2800, 5, 'Automatic', 'Petrol', 'Hyderabad', 2, '18 km/l', '3 bags', '1497 cc', ['Ventilated seats', 'Wireless charging', 'ADAS', '6 airbags'], 'A sharp-looking sedan with ventilated seats and driver-assist features.', '/verna.avif'),
    car('c5', 'Hyundai', 'Creta', 2024, 'SUV', 3400, 5, 'Automatic', 'Diesel', 'Chennai', 3, '17 km/l', '4 bags', '1493 cc', ['Panoramic sunroof', 'Ventilated seats', 'Reverse camera', 'Cruise control'], 'The all-rounder. High seating, a big boot and a smooth diesel engine.', '/creta.avif'),
    car('c6', 'Tata', 'Nexon EV', 2024, 'SUV', 3000, 5, 'Automatic', 'Electric', 'Bengaluru', 2, '325 km range', '3 bags', 'Electric motor', ['Fast charging', 'Regenerative braking', 'Touchscreen', '6 airbags'], 'Quiet and quick off the line. Charge at most public fast chargers.'),
    car('c7', 'Mahindra', 'XUV700', 2023, 'SUV', 4000, 7, 'Automatic', 'Diesel', 'Mumbai', 2, '15 km/l', '4 bags', '2184 cc', ['7 seats', 'ADAS', 'Panoramic sunroof', '360 camera'], 'Seven seats, strong torque and plenty of tech for long drives.'),
    car('c8', 'Toyota', 'Innova Crysta', 2023, 'MPV', 4200, 7, 'Manual', 'Diesel', 'Delhi', 3, '14 km/l', '5 bags', '2393 cc', ['Captain seats', 'Rear AC vents', 'Roof-mounted AC', '7 airbags'], 'The group-travel favourite. Space for seven adults and their luggage.', '/innova.avif'),
    car('c9', 'Kia', 'Carens', 2024, 'MPV', 3300, 7, 'Automatic', 'Diesel', 'Hyderabad', 2, '16 km/l', '4 bags', '1493 cc', ['Sunroof', 'Air purifier', 'Reverse camera', '6 airbags'], 'A modern three-row MPV that rides more like a car than a van.'),
    car('c10', 'Mercedes-Benz', 'E-Class', 2023, 'Luxury', 11000, 5, 'Automatic', 'Petrol', 'Mumbai', 1, '12 km/l', '3 bags', '1991 cc', ['Massage seats', 'Burmester audio', 'Air suspension', 'Ambient lighting'], 'For weddings, airport pickups and the days you want to arrive in style.'),
    car('c11', 'BMW', '5 Series', 2023, 'Luxury', 12000, 5, 'Automatic', 'Petrol', 'Delhi', 1, '12 km/l', '3 bags', '1998 cc', ['Heated seats', 'Head-up display', 'Panoramic roof', 'Parking assist'], 'A driver-focused luxury sedan with sharp handling and a refined cabin.'),
    car('c12', 'Toyota', 'Camry Hybrid', 2024, 'Luxury', 5800, 5, 'Automatic', 'Hybrid', 'Chennai', 2, '19 km/l', '3 bags', '2487 cc hybrid', ['Heated seats', 'JBL audio', 'Wireless charging', '9 airbags'], 'Hybrid efficiency in a calm, spacious executive sedan.'),
  ];
  const packages = [
    { id: 'p1', name: 'Quick Hop', unit: 'hour', hours: 1, discount: -30, description: 'Short errands and airport runs. Billed per hour.' },
    { id: 'p2', name: 'Day Out', unit: 'day', hours: 24, discount: 0, description: 'The standard rate. Fuel and tolls not included.' },
    { id: 'p3', name: 'Week Away', unit: 'week', hours: 168, discount: 12, description: 'Seven days at a lower daily rate. Good for holidays.' },
    { id: 'p4', name: 'Month Stay', unit: 'month', hours: 720, discount: 30, description: '30 days for relocations and long projects.' },
  ];
  const users = [
    { id: 'u1', name: 'Admin', email: 'admin@carrental.com', password: 'admin123', phone: '9000000001', role: 'admin', status: 'active', createdAt: iso(Date.now() - 200 * day) },
    { id: 'u2', name: 'Priya Raman', email: 'customer@carrental.com', password: 'customer123', phone: '9000000002', role: 'customer', status: 'active', createdAt: iso(Date.now() - 120 * day) },
    { id: 'u3', name: 'Arjun Mehta', email: 'arjun@example.com', password: 'arjun123', phone: '9000000003', role: 'customer', status: 'active', createdAt: iso(Date.now() - 90 * day) },
    { id: 'u4', name: 'Sana Iqbal', email: 'sana@example.com', password: 'sana123', phone: '9000000004', role: 'customer', status: 'active', createdAt: iso(Date.now() - 60 * day) },
  ];

  const rows = [
    // [carId, pkgId, qty, daysFromNow, status, userId, method]
    ['c5', 'p2', 3, -80, 'COMPLETED', 'u2', 'CARD'],
    ['c3', 'p3', 1, -70, 'COMPLETED', 'u3', 'CARD'],
    ['c1', 'p2', 2, -62, 'COMPLETED', 'u4', 'CASH'],
    ['c10', 'p2', 1, -55, 'COMPLETED', 'u3', 'WALLET'],
    ['c5', 'p2', 2, -44, 'COMPLETED', 'u4', 'CARD'],
    ['c8', 'p3', 1, -38, 'CANCELLED', 'u2', 'CARD'],
    ['c3', 'p2', 2, -30, 'COMPLETED', 'u2', 'WALLET'],
    ['c7', 'p2', 4, -22, 'COMPLETED', 'u3', 'CARD'],
    ['c5', 'p1', 5, -15, 'COMPLETED', 'u4', 'CASH'],
    ['c12', 'p2', 2, -9, 'COMPLETED', 'u2', 'CARD'],
    ['c1', 'p4', 1, -4, 'CONFIRMED', 'u3', 'CARD'],
    ['c6', 'p2', 3, 6, 'CONFIRMED', 'u2', 'WALLET'],
    ['c3', 'p2', 2, 12, 'CONFIRMED', 'u4', 'CASH'],
  ];
  const bookings = rows.map(([cid, pid, qty, off, status, uid, method], i) => {
    const c = cars.find((x) => x.id === cid);
    const p = packages.find((x) => x.id === pid);
    const u = users.find((x) => x.id === uid);
    const start = new Date(Date.now() + off * day);
    start.setHours(10, 0, 0, 0);
    return {
      id: 'b' + (i + 1), userId: u.id, userName: u.name, userEmail: u.email, carId: c.id,
      carName: `${c.make} ${c.model}`, carType: c.type, packageId: p.id, packageName: p.name, unit: p.unit,
      quantity: qty, startDate: iso(start), endDate: iso(start.getTime() + p.hours * qty * 3600000),
      pickupLocation: c.location, amount: unitPrice(c, p) * qty, paymentMethod: method,
      paymentStatus: 'PENDING',
      status, createdAt: iso(start.getTime() - 5 * day),
    };
  });
  return { cars, packages, users, bookings };
}

function load() {
  if (memory) return memory;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      memory = JSON.parse(raw);
      memory.bookings = (memory.bookings || []).map((booking) => ({
        ...booking,
        amount: booking.amount ?? booking.totalAmount ?? 0,
        status: ({ Confirmed: 'CONFIRMED', Cancelled: 'CANCELLED', Completed: 'COMPLETED' })[booking.status] || booking.status,
        paymentStatus: 'PENDING',
        paymentMethod: String(booking.paymentMethod || 'CASH').toUpperCase(),
      }));
      persist();
      return memory;
    }
  } catch {}
  memory = seed();
  persist();
  return memory;
}
function persist() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(memory));
  } catch {}
}

const clone = (v) => (v === undefined ? v : JSON.parse(JSON.stringify(v)));
const err = (m, status = 400) => Object.assign(new Error(m), { status });
const uid = (p) => p + Math.random().toString(36).slice(2, 9);
const publicUser = ({ password, ...rest }) => rest;

// every call: run on a short delay so loading states are visible, then save and return a copy
const run = (fn) =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      try {
        const db = load();
        const out = fn(db);
        persist();
        resolve(clone(out));
      } catch (e) {
        reject(e);
      }
    }, 180)
  );

function me(db) {
  const t = session.token();
  if (!t) throw err('Please log in first.', 401);
  const u = db.users.find((x) => 'mock.' + x.id === t);
  if (!u) throw err('Your session has expired. Log in again.', 401);
  return u;
}
function admin(db) {
  const u = me(db);
  if (u.role !== 'admin') throw err('Only administrators can do this.', 403);
  return u;
}

function isFree(db, car, start, end, ignoreId) {
  if (!car.available) return false;
  const clashes = db.bookings.filter(
    (b) => b.carId === car.id && b.status === 'CONFIRMED' && b.id !== ignoreId && new Date(b.startDate) < end && new Date(b.endDate) > start
  ).length;
  return clashes < car.quantity;
}

function filterCars(db, p) {
  let list = db.cars;
  if (p.location) list = list.filter((c) => c.location.toLowerCase() === p.location.toLowerCase());
  if (p.type) list = list.filter((c) => c.type === p.type);
  if (p.q) list = list.filter((c) => `${c.make} ${c.model}`.toLowerCase().includes(p.q.toLowerCase()));
  if (p.start && p.end) {
    const s = new Date(p.start), e = new Date(p.end);
    list = list.filter((c) => isFree(db, c, s, e));
  }
  return list;
}

function priceBooking(db, car, packageId, qty, startISO, ignoreId) {
  const pkg = db.packages.find((x) => x.id === packageId);
  if (!pkg) throw err('That rental package no longer exists. Pick another.', 404);
  const q = Math.max(1, parseInt(qty) || 1);
  const start = new Date(startISO);
  if (isNaN(start)) throw err('Choose a valid pickup date and time.');
  if (start < Date.now() - 60000) throw err('Pickup must be in the future.');
  const end = new Date(start.getTime() + pkg.hours * q * 3600000);
  if (!isFree(db, car, start, end, ignoreId)) throw err('This car is not free for those dates. Try other dates or another car.', 409);
  return { pkg, q, start, end, total: unitPrice(car, pkg) * q };
}

export const mock = {
  // auth
  login: (b) =>
    run((db) => {
      const u = db.users.find((x) => x.email.toLowerCase() === String(b.email).toLowerCase() && x.password === b.password);
      if (!u) throw err('Email or password is incorrect.', 401);
      if (u.status === 'blocked') throw err('This account is blocked. Contact support.', 403);
      return { token: 'mock.' + u.id, user: publicUser(u) };
    }),
  register: (b) =>
    run((db) => {
      if (db.users.some((x) => x.email.toLowerCase() === String(b.email).toLowerCase())) throw err('An account with this email already exists.', 409);
      const u = { id: uid('u'), name: b.name, email: b.email, phone: b.phone || '', password: b.password, role: 'customer', status: 'active', createdAt: iso(Date.now()) };
      db.users.push(u);
      return { token: 'mock.' + u.id, user: publicUser(u) };
    }),

  // cars
  getCars: (p = {}) => run((db) => filterCars(db, p)),
  getLocations: () => run((db) => [...new Set(db.cars.map((car) => car.location))].sort().map((name, index) => ({ id: index + 1, name }))),
  getCar: (id) =>
    run((db) => {
      const c = db.cars.find((x) => x.id === id);
      if (!c) throw err('Car not found.', 404);
      return c;
    }),
  createCar: (b) => run((db) => { admin(db); const c = { ...b, id: uid('c') }; db.cars.unshift(c); return c; }),
  updateCar: (id, b) =>
    run((db) => {
      admin(db);
      const i = db.cars.findIndex((x) => x.id === id);
      if (i < 0) throw err('Car not found.', 404);
      return (db.cars[i] = { ...db.cars[i], ...b, id });
    }),
  deleteCar: (id) =>
    run((db) => {
      admin(db);
      if (db.bookings.some((b) => b.carId === id && b.status === 'CONFIRMED' && new Date(b.endDate) > Date.now()))
        throw err('This car has upcoming bookings. Cancel them or mark the car unavailable instead.', 409);
      db.cars = db.cars.filter((x) => x.id !== id);
      return true;
    }),

  // packages
  getPackages: () => run((db) => db.packages),
  getPackage: (id) => run((db) => {
    const pkg = db.packages.find((item) => item.id === id);
    if (!pkg) throw err('Package not found.', 404);
    return pkg;
  }),
  createPackage: (b) => run((db) => { admin(db); const p = { ...b, id: uid('p') }; db.packages.push(p); return p; }),
  updatePackage: (id, b) =>
    run((db) => {
      admin(db);
      const i = db.packages.findIndex((x) => x.id === id);
      if (i < 0) throw err('Package not found.', 404);
      return (db.packages[i] = { ...db.packages[i], ...b, id });
    }),
  deletePackage: (id) => run((db) => { admin(db); db.packages = db.packages.filter((x) => x.id !== id); return true; }),

  // bookings
  getMyBookings: () => run((db) => { const u = me(db); return db.bookings.filter((b) => b.userId === u.id); }),
  getAllBookings: () => run((db) => { admin(db); return db.bookings; }),
  getBooking: (id) => run((db) => {
    const u = me(db);
    const booking = db.bookings.find((item) => item.id === id);
    if (!booking) throw err('Booking not found.', 404);
    if (booking.userId !== u.id && u.role !== 'admin') throw err('This is not your booking.', 403);
    return booking;
  }),
  createBooking: (b) =>
    run((db) => {
      const u = me(db);
      const car = db.cars.find((x) => x.id === b.carId);
      if (!car) throw err('Car not found.', 404);
      const { pkg, q, start, end, total } = priceBooking(db, car, b.packageId, b.quantity, b.startDate);
      const bk = {
        id: uid('b'), userId: u.id, userName: u.name, userEmail: u.email, carId: car.id,
        carName: `${car.make} ${car.model}`, carType: car.type, packageId: pkg.id, packageName: pkg.name, unit: pkg.unit,
        quantity: q, startDate: start.toISOString(), endDate: end.toISOString(), pickupLocation: car.location,
        amount: total, paymentMethod: String(b.paymentMethod || 'CASH').toUpperCase(),
        paymentStatus: 'PENDING', status: 'CONFIRMED', createdAt: iso(Date.now()),
      };
      db.bookings.unshift(bk);
      return bk;
    }),
  updateBooking: (id, b) =>
    run((db) => {
      const u = me(db);
      const i = db.bookings.findIndex((x) => x.id === id);
      if (i < 0) throw err('Booking not found.', 404);
      const bk = db.bookings[i];
      if (bk.userId !== u.id && u.role !== 'admin') throw err('This is not your booking.', 403);
      if (bk.status !== 'CONFIRMED') throw err('Only confirmed bookings can be changed.');
      const car = db.cars.find((x) => x.id === bk.carId);
      if (!car) throw err('This car is no longer in the fleet.', 404);
      const { pkg, q, start, end, total } = priceBooking(db, car, b.packageId || bk.packageId, b.quantity ?? bk.quantity, b.startDate || bk.startDate, id);
      return (db.bookings[i] = { ...bk, packageId: pkg.id, packageName: pkg.name, unit: pkg.unit, quantity: q, startDate: start.toISOString(), endDate: end.toISOString(), amount: total });
    }),
  cancelBooking: (id) =>
    run((db) => {
      const u = me(db);
      const bk = db.bookings.find((x) => x.id === id);
      if (!bk) throw err('Booking not found.', 404);
      if (bk.userId !== u.id && u.role !== 'admin') throw err('This is not your booking.', 403);
      if (bk.status !== 'CONFIRMED') throw err('This booking is already closed.');
      bk.status = 'CANCELLED';
      bk.paymentStatus = 'PENDING';
      return bk;
    }),

  // users
  getUsers: () => run((db) => { admin(db); return db.users.map(publicUser); }),
  getUser: (id) => run((db) => {
    admin(db);
    const user = db.users.find((item) => item.id === id);
    if (!user) throw err('User not found.', 404);
    return publicUser(user);
  }),
  updateUser: (id, b) =>
    run((db) => {
      admin(db);
      const i = db.users.findIndex((x) => x.id === id);
      if (i < 0) throw err('User not found.', 404);
      const next = { ...db.users[i], ...b, id };
      if (!b.password) next.password = db.users[i].password;
      return publicUser((db.users[i] = next));
    }),
  deleteUser: (id) =>
    run((db) => {
      const a = admin(db);
      if (a.id === id) throw err('You cannot delete your own account.');
      db.users = db.users.filter((x) => x.id !== id);
      return true;
    }),
};
