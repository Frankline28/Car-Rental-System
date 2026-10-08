'use client';
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ErrorBox, Loading, PageHead } from '@/components/ui';
import { fetchAllBookings } from '@/store/bookingsSlice';
import { fetchCars } from '@/store/carsSlice';
import { buildReport, bookingsToCsv, downloadText } from '@/lib/report';
import { money } from '@/lib/format';
import { UNIT_META } from '@/lib/constants';

function Bars({ rows, format = (v) => v, valueKey = 'value', labelKey = 'label' }) {
  const max = Math.max(1, ...rows.map((r) => r[valueKey]));
  if (!rows.length) return <p className="muted small">No data yet.</p>;
  return (
    <ul className="bars">
      {rows.map((r) => (
        <li key={r[labelKey]}>
          <span className="bar-label">{r[labelKey]}</span>
          <span className="bar-track"><span className="bar-fill" style={{ width: `${(r[valueKey] / max) * 100}%` }} /></span>
          <span className="bar-value">{format(r[valueKey])}</span>
        </li>
      ))}
    </ul>
  );
}

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { all, status, error } = useSelector((s) => s.bookings);
  const cars = useSelector((s) => s.cars.items);

  useEffect(() => {
    dispatch(fetchAllBookings());
    dispatch(fetchCars({}));
  }, [dispatch]);

  const r = useMemo(() => buildReport(all), [all]);
  const fleet = cars.reduce((s, c) => s + (c.quantity || 1), 0);

  return (
    <>
      <PageHead
        title="Dashboard"
        action={<button className="btn btn-ghost" disabled={!all.length} onClick={() => downloadText('bookings-report.csv', bookingsToCsv(all))}>Download bookings CSV</button>}
      >
        Bookings, revenue and the most rented cars.
      </PageHead>
      {status === 'error' && <ErrorBox message={error} onRetry={() => dispatch(fetchAllBookings())} />}
      {status === 'loading' && !all.length && <Loading />}

      <div className="stat-grid">
        <div className="stat"><span>Revenue</span><strong>{money(r.revenue)}</strong><small>Excludes cancelled bookings</small></div>
        <div className="stat"><span>Total bookings</span><strong>{r.total}</strong><small>{r.confirmed} confirmed, {r.cancelled} cancelled</small></div>
        <div className="stat"><span>Average booking</span><strong>{money(r.average)}</strong></div>
        <div className="stat"><span>Cars in fleet</span><strong>{fleet}</strong><small>{cars.length} models</small></div>
      </div>

      <div className="report-grid">
        <section className="card">
          <h2 className="h3">Revenue by month</h2>
          <Bars rows={r.monthly} format={money} />
        </section>
        <section className="card">
          <h2 className="h3">Most rented models</h2>
          <Bars rows={r.popular.map((p) => ({ label: p.name, value: p.count }))} format={(v) => `${v} ${v === 1 ? 'booking' : 'bookings'}`} />
        </section>
        <section className="card">
          <h2 className="h3">Bookings by package</h2>
          <Bars rows={r.byUnit.map((u) => ({ label: UNIT_META[u.name]?.label || u.name, value: u.count }))} />
        </section>
      </div>
    </>
  );
}
