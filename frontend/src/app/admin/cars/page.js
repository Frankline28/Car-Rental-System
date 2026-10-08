'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '@/components/Modal';
import { Empty, ErrorBox, Field, Loading, PageHead } from '@/components/ui';
import { fetchCars, removeCar, saveCar } from '@/store/carsSlice';
import { CAR_TYPES, FUELS, TRANSMISSIONS } from '@/lib/constants';
import { errMsg, money, carImageSrc } from '@/lib/format';

const BLANK = {
    make: '', model: '', year: new Date().getFullYear(), type: 'Sedan', location: '', dailyRate: '', hourlyRate: '', weeklyRate: '', monthlyRate: '', quantity: 1, seats: 5,
  transmission: 'Manual', fuel: 'Petrol', engine: '', power: '', acceleration: '', image: '', features: '', available: true,
};

function CarForm({ car, onClose }) {
  const dispatch = useDispatch();
  const locations = useSelector((s) => s.locations.items);
  const [f, setF] = useState(car ? { ...BLANK, ...car, ...car.specifications, features: (car.features || []).join(', ') } : BLANK);
  const [errs, setErrs] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  async function submit(e) {
    e.preventDefault();
    const v = {};
    if (!f.make.trim()) v.make = 'Enter the make.';
    if (!f.model.trim()) v.model = 'Enter the model.';
    if (!(+f.year >= 1990 && +f.year <= new Date().getFullYear() + 1)) v.year = 'Enter a valid year.';
    if (!(+f.dailyRate > 0)) v.dailyRate = 'Enter a daily rate above 0.';
    if (!(+f.quantity >= 1)) v.quantity = 'At least 1.';
    setErrs(v);
    if (Object.keys(v).length) return;
    setBusy(true);
    setServerError('');
    try {
      const data = {
        ...f,
        year: +f.year, dailyRate: +f.dailyRate, quantity: +f.quantity, seats: +f.seats,
        features: f.features.split(',').map((x) => x.trim()).filter(Boolean),
        specifications: { engine: f.engine || '', power: f.power || '', acceleration: f.acceleration || '' },
      };
      await dispatch(saveCar({ id: car?.id, data })).unwrap();
      onClose();
    } catch (err) {
      setServerError(errMsg(err));
      setBusy(false);
    }
  }

  function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      setF((prev) => ({ ...prev, image: loadEvt.target.result }));
    };
    reader.readAsDataURL(file);
  }

  return (
    <Modal title={car ? `Edit ${car.make} ${car.model}` : 'Add a car'} onClose={onClose} wide>
      <form onSubmit={submit} noValidate>
        <div className="form-grid">
          <Field label="Make" error={errs.make}><input className="input" value={f.make} onChange={set('make')} /></Field>
          <Field label="Model" error={errs.model}><input className="input" value={f.model} onChange={set('model')} /></Field>
          <Field label="Year" error={errs.year}><input className="input" type="number" value={f.year} onChange={set('year')} /></Field>
          <Field label="Type"><select className="input" value={f.type} onChange={set('type')}>{CAR_TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
          <Field label="City"><select className="input" value={f.location} onChange={set('location')}><option value="">Select a city</option>{locations.map((t) => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Rate per day (INR)" error={errs.dailyRate}><input className="input" type="number" min="0" value={f.dailyRate} onChange={set('dailyRate')} /></Field>
          <Field label="Hourly rate (INR)"><input className="input" type="number" min="0" value={f.hourlyRate ?? ''} onChange={set('hourlyRate')} /></Field>
          <Field label="Weekly rate (INR)"><input className="input" type="number" min="0" value={f.weeklyRate ?? ''} onChange={set('weeklyRate')} /></Field>
          <Field label="Monthly rate (INR)"><input className="input" type="number" min="0" value={f.monthlyRate ?? ''} onChange={set('monthlyRate')} /></Field>
          <Field label="Cars in fleet" error={errs.quantity}><input className="input" type="number" min="1" value={f.quantity} onChange={set('quantity')} /></Field>
          <Field label="Seats"><input className="input" type="number" min="1" max="12" value={f.seats} onChange={set('seats')} /></Field>
          <Field label="Transmission"><select className="input" value={f.transmission} onChange={set('transmission')}>{TRANSMISSIONS.map((t) => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Fuel"><select className="input" value={f.fuel} onChange={set('fuel')}>{FUELS.map((t) => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Engine"><input className="input" placeholder="1498 cc" value={f.engine || ''} onChange={set('engine')} /></Field>
          <Field label="Power"><input className="input" value={f.power || ''} onChange={set('power')} /></Field>
          <Field label="Acceleration"><input className="input" value={f.acceleration || ''} onChange={set('acceleration')} /></Field>
        </div>

        <div style={{ marginTop: '0.5rem', marginBottom: '1rem', padding: '1rem', background: '#f8f9f6', border: '1.5px dashed var(--line)', borderRadius: '8px' }}>
          <span style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Car Image</span>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {f.image ? (
              <div style={{ position: 'relative', width: '130px', height: '85px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--line)', background: '#e9ebe4' }}>
                <img
                  src={carImageSrc(f.image)}
                  alt="Car preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <button
                  type="button"
                  onClick={() => setF((prev) => ({ ...prev, image: '' }))}
                  style={{ position: 'absolute', top: 3, right: 3, background: 'rgba(0,0,0,0.65)', color: '#fff', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Remove image"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div style={{ width: '130px', height: '85px', borderRadius: '6px', border: '1px dashed #b9beb4', display: 'grid', placeItems: 'center', color: 'var(--mute)', fontSize: '0.82rem', background: '#fff' }}>
                No image selected
              </div>
            )}

            <div style={{ display: 'grid', gap: '0.5rem', flex: 1 }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
                  📁 Choose image from device
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                  />
                </label>
                <span className="small muted">or enter image filename / URL below:</span>
              </div>
              <input
                className="input"
                placeholder="e.g. swift.avif or https://... or data:image/..."
                value={f.image || ''}
                onChange={set('image')}
              />
            </div>
          </div>
        </div>

        <Field label="Features" hint="Separate with commas."><input className="input" value={f.features} onChange={set('features')} /></Field>
        <label className="check"><input type="checkbox" checked={!!f.available} onChange={set('available')} /> Available for booking</label>
        {serverError && <div className="notice notice-error" role="alert">{serverError}</div>}
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : car ? 'Save changes' : 'Add car'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminCars() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((s) => s.cars);
  const [editing, setEditing] = useState(null); // null | 'new' | car
  const [deleting, setDeleting] = useState(null);
  const [delError, setDelError] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => {
    dispatch(fetchCars({}));
  }, [dispatch]);

  const rows = items.filter((c) => `${c.make} ${c.model} ${c.type} ${c.location}`.toLowerCase().includes(q.toLowerCase()));

  async function confirmDelete() {
    try {
      await dispatch(removeCar(deleting.id)).unwrap();
      setDeleting(null);
      setDelError('');
    } catch (e) {
      setDelError(errMsg(e));
    }
  }

  return (
    <>
      <PageHead title="Cars" action={<button className="btn btn-primary" onClick={() => setEditing('new')}>Add a car</button>}>
        Manage the fleet: models, rates, quantities and availability.
      </PageHead>
      <div className="toolbar">
        <input className="input" type="search" placeholder="Search cars" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search cars" />
      </div>
      {status === 'error' && <ErrorBox message={error} onRetry={() => dispatch(fetchCars({}))} />}
      {status === 'loading' && !items.length && <Loading />}
      {status === 'ready' && !rows.length && <Empty title="No cars found">Add a car to start building the fleet.</Empty>}
      {!!rows.length && (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Car</th><th>Type</th><th>City</th><th>Rate per day</th><th>Fleet</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {c.image ? (
                        <img
                          src={carImageSrc(c.image)}
                          alt=""
                          style={{ width: '48px', height: '32px', objectFit: 'cover', borderRadius: '4px', background: '#e9ebe4' }}
                        />
                      ) : null}
                      <div>
                        <strong>{c.make} {c.model}</strong><br /><span className="muted small">{c.year}, {c.transmission}, {c.fuel}</span>
                      </div>
                    </div>
                  </td>
                  <td>{c.type}</td>
                  <td>{c.location}</td>
                  <td>{money(c.dailyRate)}</td>
                  <td>{c.quantity}</td>
                  <td><span className={`tag ${c.available ? 'tag-confirmed' : 'tag-cancelled'}`}>{c.available ? 'Available' : 'Unavailable'}</span></td>
                  <td className="actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(c)}>Edit</button>
                    <button className="btn btn-danger-ghost btn-sm" onClick={() => { setDeleting(c); setDelError(''); }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing && <CarForm car={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
      {deleting && (
        <Modal title={`Delete ${deleting.make} ${deleting.model}?`} onClose={() => setDeleting(null)}>
          <p>Cars with booking history cannot be deleted. Mark the car unavailable instead.</p>
          {delError && <div className="notice notice-error" role="alert">{delError}</div>}
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setDeleting(null)}>Keep car</button>
            <button className="btn btn-danger" onClick={confirmDelete}>Delete car</button>
          </div>
        </Modal>
      )}
    </>
  );
}
