'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import RequireAuth from '@/components/RequireAuth';
import Modal from '@/components/Modal';
import { Empty, ErrorBox, Field, Loading, PageHead, StatusTag } from '@/components/ui';
import { cancelBooking, fetchMyBookings, updateBooking } from '@/store/bookingsSlice';
import { UNIT_META, UNIT_ORDER } from '@/lib/constants';
import { addDuration, combineDateTime, errMsg, fmtDateTime, money, qtyLabel, splitDateTime, todayStr, unitPrice } from '@/lib/format';
import { fetchCars } from '@/store/carsSlice';

const displayStatus = (b) => b.status === 'CONFIRMED' && new Date(b.endDate) < new Date() ? 'COMPLETED' : b.status;
const canChange = (b) => b.status === 'CONFIRMED' && new Date(b.startDate) > new Date();

function ModifyDialog({ booking, onClose }) {
  const dispatch = useDispatch();
  const packages = useSelector((s) => s.packages.items);
  const cars = useSelector((s) => s.cars.items);
  const car = cars.find((c) => String(c.id) === String(booking.carId));
  const start = splitDateTime(booking.startDate);
  const [f, setF] = useState({ unit: booking.unit, qty: booking.quantity, date: start.date, time: start.time });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const sorted = [...packages].sort((a, b) => UNIT_ORDER.indexOf(a.unit) - UNIT_ORDER.indexOf(b.unit));
  const pkg = packages.find((p) => p.unit === f.unit);
  const qty = Math.max(1, parseInt(f.qty) || 1);
  const startISO = combineDateTime(f.date, f.time);
  const estimate = car && pkg ? unitPrice(car, pkg) * qty : null;

  async function save() {
    setError('');
    if (!pkg || !startISO) return setError('Choose a valid package and pickup time.');
    if (new Date(startISO) < new Date()) return setError('Pickup must be in the future.');
    setBusy(true);
    try {
      await dispatch(
        updateBooking({ id: booking.id, data: { carId: booking.carId, packageId: pkg.id, quantity: qty, startDate: startISO, endDate: addDuration(startISO, pkg, qty), pickupLocation: booking.pickupLocation, paymentMethod: booking.paymentMethod } })
      ).unwrap();
      onClose();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={`Change booking for ${booking.carName}`} onClose={onClose}>
      <Field label="Rental package">
        <select className="input" value={f.unit} onChange={(e) => setF({ ...f, unit: e.target.value })}>
          {sorted.map((p) => <option key={p.id} value={p.unit}>{p.name} ({UNIT_META[p.unit]?.label})</option>)}
        </select>
      </Field>
      <div className="two-col">
        <Field label="Pickup date"><input className="input" type="date" min={todayStr()} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} suppressHydrationWarning /></Field>
        <Field label="Pickup time"><input className="input" type="time" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} /></Field>
      </div>
      <Field label={`How many ${UNIT_META[f.unit]?.plural || 'days'}`}>
        <input className="input" type="number" min="1" max="365" value={f.qty} onChange={(e) => setF({ ...f, qty: e.target.value })} />
      </Field>
      {pkg && startISO && (
        <div className="summary">
          <div><span>Return by</span><strong>{fmtDateTime(addDuration(startISO, pkg, qty))}</strong></div>
          {estimate != null && <div><span>Estimated new total</span><strong>{money(estimate)}</strong></div>}
          {estimate != null && <p className="muted small">The server recalculates the final amount when you save.</p>}
        </div>
      )}
      {error && <div className="notice notice-error" role="alert">{error}</div>}
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Keep as is</button>
        <button className="btn btn-primary" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
      </div>
    </Modal>
  );
}

function CancelDialog({ booking, onClose }) {
  const dispatch = useDispatch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function confirm() {
    setBusy(true);
    try {
      await dispatch(cancelBooking(booking.id)).unwrap();
      onClose();
    } catch (e) {
      setError(errMsg(e));
      setBusy(false);
    }
  }
  return (
    <Modal title="Cancel this booking?" onClose={onClose}>
      <p>
        {booking.carName}, {fmtDateTime(booking.startDate)}. Payment has not been processed; no charge or refund has been made.
      </p>
      {error && <div className="notice notice-error" role="alert">{error}</div>}
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Keep booking</button>
        <button className="btn btn-danger" onClick={confirm} disabled={busy}>{busy ? 'Cancelling…' : 'Cancel booking'}</button>
      </div>
    </Modal>
  );
}

function MyBookings() {
  const dispatch = useDispatch();
  const { mine, status, error } = useSelector((s) => s.bookings);
  const [tab, setTab] = useState('upcoming');
  const [editing, setEditing] = useState(null);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    dispatch(fetchMyBookings());
    dispatch(fetchCars({}));
  }, [dispatch]);

  const groups = useMemo(() => {
    const g = { upcoming: [], past: [], cancelled: [] };
    mine.forEach((b) => {
      const s = displayStatus(b);
      (s === 'CANCELLED' ? g.cancelled : s === 'COMPLETED' ? g.past : g.upcoming).push(b);
    });
    g.upcoming.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    return g;
  }, [mine]);

  const tabs = [['upcoming', 'Upcoming'], ['past', 'Past'], ['cancelled', 'Cancelled']];
  const list = groups[tab];

  return (
    <div className="container page">
      <PageHead title="My bookings" action={<Link href="/cars" className="btn btn-primary">Book another car</Link>}>
        Change or cancel a booking any time before pickup.
      </PageHead>
      <div className="tabs" role="tablist">
        {tabs.map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'active' : ''} onClick={() => setTab(k)}>
            {label} <span className="count">{groups[k].length}</span>
          </button>
        ))}
      </div>

      {status === 'error' && <ErrorBox message={error} onRetry={() => dispatch(fetchMyBookings())} />}
      {status === 'loading' && !mine.length && <Loading text="Loading your bookings…" />}
      {status === 'ready' && !list.length && (
        <Empty title={tab === 'upcoming' ? 'No upcoming trips' : `No ${tab} bookings`}>
          {tab === 'upcoming' && <Link href="/cars" className="text-link">Find a car for your next trip</Link>}
        </Empty>
      )}

      <div className="booking-list">
        {list.map((b) => (
          <article key={b.id} className="booking-card">
            <div className="booking-main">
              <div className="booking-head">
                <h3>{b.carName}</h3>
                <StatusTag status={displayStatus(b)} />
              </div>
              <p className="muted small">Reference {b.id}</p>
              <dl className="specs tight">
                <div><dt>Pickup</dt><dd>{fmtDateTime(b.startDate)} in {b.pickupLocation}</dd></div>
                <div><dt>Return by</dt><dd>{fmtDateTime(b.endDate)}</dd></div>
                <div><dt>Package</dt><dd>{b.packageName}, {qtyLabel(b.unit, b.quantity)}</dd></div>
                <div><dt>Payment</dt><dd>{b.paymentStatus === 'PENDING' ? 'Pending — no payment processed' : b.paymentStatus}</dd></div>
              </dl>
            </div>
            <div className="booking-side">
              <strong className="booking-total">{money(b.amount)}</strong>
              {canChange(b) && (
                <div className="row-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing(b)}>Change</button>
                  <button className="btn btn-danger-ghost btn-sm" onClick={() => setCancelling(b)}>Cancel</button>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      {editing && <ModifyDialog booking={editing} onClose={() => setEditing(null)} />}
      {cancelling && <CancelDialog booking={cancelling} onClose={() => setCancelling(null)} />}
    </div>
  );
}

export default function BookingsPage() {
  return (
    <RequireAuth>
      <MyBookings />
    </RequireAuth>
  );
}
