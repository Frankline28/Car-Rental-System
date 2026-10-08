import { UNIT_META } from './constants';

export const money = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

export const fmtDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
    : '';

export const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

const pad = (n) => String(n).padStart(2, '0');

export function splitDateTime(iso) {
  const d = new Date(iso);
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

export const todayStr = () => splitDateTime(new Date().toISOString()).date;

export function combineDateTime(date, time) {
  const d = new Date(`${date}T${time || '10:00'}`);
  return isNaN(d) ? null : d.toISOString();
}

/** Price of ONE unit of a package for a car. Negative discount = premium (used for hourly). */
export function unitPrice(car, pkg) {
  const configuredRate = ({ hour: car.hourlyRate, day: car.dailyRate, week: car.weeklyRate, month: car.monthlyRate })[pkg.unit];
  const base = configuredRate != null
    ? Number(configuredRate)
    : (Number(car.dailyRate) / 24) * Number(pkg.hours);
  return Math.round((base * (100 - (pkg.discount || 0))) / 100);
}
export const totalPrice = (car, pkg, qty) => unitPrice(car, pkg) * qty;

export function addDuration(startISO, pkg, qty) {
  return new Date(new Date(startISO).getTime() + pkg.hours * qty * 3600000).toISOString();
}

export function qtyLabel(unit, qty) {
  const m = UNIT_META[unit] || { noun: unit, plural: unit + 's' };
  return `${qty} ${qty === 1 ? m.noun : m.plural}`;
}

export const errMsg = (e) => (typeof e === 'string' ? e : e?.message || 'Something went wrong. Try again.');

export function carImageSrc(image) {
  if (!image) return '';
  if (image.startsWith('data:') || image.startsWith('http://') || image.startsWith('https://') || image.startsWith('/')) {
    return image;
  }
  return `/${image}`;
}
