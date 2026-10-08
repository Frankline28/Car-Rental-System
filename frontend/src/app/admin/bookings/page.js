'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '@/components/Modal';
import { Empty, ErrorBox, Loading, PageHead, StatusTag } from '@/components/ui';
import { cancelBooking, fetchAllBookings } from '@/store/bookingsSlice';
import { bookingsToCsv, downloadText } from '@/lib/report';
import { errMsg, fmtDateTime, money, qtyLabel } from '@/lib/format';

const shown = (b) => b.status === 'CONFIRMED' && new Date(b.endDate) < new Date() ? 'COMPLETED' : b.status;

export default function AdminBookings() {
  const dispatch = useDispatch();
  const { all, status, error } = useSelector((s) => s.bookings);
  const [filter, setFilter] = useState('All');
  const [q, setQ] = useState('');
  const [cancelling, setCancelling] = useState(null);
  const [cErr, setCErr] = useState('');

  useEffect(() => {
    dispatch(fetchAllBookings());
  }, [dispatch]);

  const rows = all.filter(
    (b) => (filter === 'All' || shown(b) === filter) && `${b.id} ${b.userName} ${b.carName}`.toLowerCase().includes(q.toLowerCase())
  );

  async function confirmCancel() {
    try {
      await dispatch(cancelBooking(cancelling.id)).unwrap();
      setCancelling(null);
    } catch (e) {
      setCErr(errMsg(e));
    }
  }

  return (
    <>
      <PageHead title="Bookings" action={<button className="btn btn-ghost" disabled={!rows.length} onClick={() => downloadText('bookings.csv', bookingsToCsv(rows))}>Download CSV</button>}>
        Every booking across all customers.
      </PageHead>
      <div className="toolbar">
        <input className="input" type="search" placeholder="Search by reference, customer or car" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search bookings" />
        <label className="inline-field">
          <span>Status</span>
          <select className="input" value={filter} onChange={(e) => setFilter(e.target.value)}>
            {[['All', 'All'], ['CONFIRMED', 'Confirmed'], ['COMPLETED', 'Completed'], ['CANCELLED', 'Cancelled']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
      </div>
      {status === 'error' && <ErrorBox message={error} onRetry={() => dispatch(fetchAllBookings())} />}
      {status === 'loading' && !all.length && <Loading />}
      {status === 'ready' && !rows.length && <Empty title="No bookings match" />}
      {!!rows.length && (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Reference</th><th>Customer</th><th>Car</th><th>Pickup</th><th>Package</th><th>Amount</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td>{b.userName}<br /><span className="muted small">{b.userEmail}</span></td>
                  <td>{b.carName}</td>
                  <td>{fmtDateTime(b.startDate)}</td>
                  <td>{b.packageName}<br /><span className="muted small">{qtyLabel(b.unit, b.quantity)}</span></td>
                  <td>{money(b.amount)}<br /><span className="muted small">{b.paymentStatus === 'PENDING' ? 'Payment pending' : b.paymentStatus}</span></td>
                  <td><StatusTag status={shown(b)} /></td>
                  <td className="actions">
                    {b.status === 'CONFIRMED' && new Date(b.startDate) > new Date() && (
                      <button className="btn btn-danger-ghost btn-sm" onClick={() => { setCancelling(b); setCErr(''); }}>Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {cancelling && (
        <Modal title="Cancel this booking?" onClose={() => setCancelling(null)}>
          <p>{cancelling.userName}'s booking for {cancelling.carName} on {fmtDateTime(cancelling.startDate)} will be cancelled.</p>
          {cErr && <div className="notice notice-error" role="alert">{cErr}</div>}
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setCancelling(null)}>Keep booking</button>
            <button className="btn btn-danger" onClick={confirmCancel}>Cancel booking</button>
          </div>
        </Modal>
      )}
    </>
  );
}
