import { fmtDateTime } from './format';

export function buildReport(bookings = []) {
  const live = bookings.filter((b) => b.status !== 'CANCELLED');
  const revenue = live.reduce((s, b) => s + (b.amount || 0), 0);

  const byStatus = {};
  bookings.forEach((b) => (byStatus[b.status] = (byStatus[b.status] || 0) + 1));

  const models = {};
  live.forEach((b) => (models[b.carName] = (models[b.carName] || 0) + 1));
  const popular = Object.entries(models)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const months = {};
  live.forEach((b) => {
    const k = (b.startDate || '').slice(0, 7);
    if (k) months[k] = (months[k] || 0) + (b.amount || 0);
  });
  const monthly = Object.entries(months)
    .sort()
    .slice(-6)
    .map(([k, v]) => ({
      label: new Date(k + '-01').toLocaleString('en-IN', { month: 'short', year: '2-digit' }),
      value: v,
    }));

  const units = {};
  live.forEach((b) => (units[b.unit] = (units[b.unit] || 0) + 1));

  return {
    total: bookings.length,
    confirmed: byStatus.CONFIRMED || 0,
    cancelled: byStatus.CANCELLED || 0,
    revenue,
    average: live.length ? Math.round(revenue / live.length) : 0,
    popular,
    monthly,
    byUnit: Object.entries(units).map(([name, count]) => ({ name, count })),
  };
}

export function bookingsToCsv(rows) {
  const head = ['Booking ID', 'Customer', 'Email', 'Car', 'Package', 'Quantity', 'Pickup', 'Return', 'Amount (INR)', 'Payment', 'Status'];
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = rows.map((b) =>
    [b.id, b.userName, b.userEmail, b.carName, b.packageName, b.quantity, fmtDateTime(b.startDate), fmtDateTime(b.endDate), b.amount, b.paymentMethod, b.status]
      .map(esc)
      .join(',')
  );
  return [head.map(esc).join(','), ...lines].join('\n');
}

export function downloadText(filename, text, type = 'text/csv') {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
