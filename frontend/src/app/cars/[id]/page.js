'use client';
import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import CarArt from '@/components/CarArt';
import { ErrorBox, Field, Loading } from '@/components/ui';
import { checkAvailability, fetchCar } from '@/store/carsSlice';
import { UNIT_META, UNIT_ORDER } from '@/lib/constants';
import { addDuration, combineDateTime, fmtDateTime, money, qtyLabel, todayStr, unitPrice, carImageSrc } from '@/lib/format';

function Detail() {
  const { id } = useParams();
  const sp = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { current, currentStatus, currentError, availability } = useSelector((s) => s.cars);
  const packages = useSelector((s) => s.packages.items);
  const user = useSelector((s) => s.auth.user);

  const [form, setForm] = useState({
    unit: sp.get('unit') || 'day',
    qty: parseInt(sp.get('qty')) || 1,
    date: sp.get('date') || '',
    time: sp.get('time') || '10:00',
  });

  useEffect(() => {
    dispatch(fetchCar(id));
  }, [dispatch, id]);

  const car = current && String(current.id) === String(id) ? current : null;
  const sorted = useMemo(() => [...packages].sort((a, b) => UNIT_ORDER.indexOf(a.unit) - UNIT_ORDER.indexOf(b.unit)), [packages]);
  const pkg = packages.find((p) => p.unit === form.unit) || sorted[0];
  const qty = Math.max(1, parseInt(form.qty) || 1);

  const range = useMemo(() => {
    if (!form.date || !pkg) return null;
    const start = combineDateTime(form.date, form.time);
    return start ? { start, end: addDuration(start, pkg, qty) } : null;
  }, [form.date, form.time, pkg, qty]);

  useEffect(() => {
    if (range && car) dispatch(checkAvailability({ carId: car.id, ...range }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range?.start, range?.end, car?.id]);

  if (currentStatus === 'error' && !car)
    return (
      <div className="container page">
        <ErrorBox message={currentError} />
        <p><Link href="/cars" className="text-link">Back to all cars</Link></p>
      </div>
    );
  if (!car) return <Loading text="Loading car…" />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const past = range && new Date(range.start) < new Date();
  const busy = !car.available || (range && availability === 'busy');
  const canContinue = range && pkg && !busy && !past;

  function goCheckout() {
    const qs = new URLSearchParams({ car: car.id, unit: pkg.unit, qty, date: form.date, time: form.time });
    router.push(`/checkout?${qs.toString()}`);
  }

  const specs = [
    ['Year', car.year], ['Type', car.type], ['Seats', car.seats], ['Transmission', car.transmission],
    ['Fuel', car.fuel], ['Engine', car.specifications?.engine], ['Power', car.specifications?.power],
    ['Acceleration', car.specifications?.acceleration], ['Pickup city', car.location],
  ].filter(([, v]) => v);

  return (
    <div className="container page">
      <p className="crumbs"><Link href="/cars" className="text-link">All cars</Link></p>
      <div className="detail-grid">
        <div>
          <div className="detail-art">
            {car.image ? (
              <img
                src={carImageSrc(car.image)}
                alt={`${car.make} ${car.model}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <CarArt type={car.type} color={car.color} />
            )}
          </div>
          <div className="detail-title">
            <h1>{car.make} {car.model}</h1>
            <span className="tag">{car.type}</span>
            {!car.available && <span className="tag tag-cancelled">Unavailable</span>}
          </div>
          <h2 className="h3">Specifications</h2>
          <dl className="specs">
            {specs.map(([k, v]) => (
              <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>

          {!!car.features?.length && (
            <>
              <h2 className="h3">Features</h2>
              <ul className="feature-list">
                {car.features.map((f) => <li key={f}>{f}</li>)}
              </ul>
            </>
          )}
          <p className="muted small">{car.quantity} {car.quantity === 1 ? 'car' : 'cars'} of this model in the fleet. Fuel and tolls are not included in the rental price.</p>
        </div>

        <aside className="book-panel">
          <h2 className="h3">Book this car</h2>
          <fieldset className="pkg-pick">
            <legend>Rental package</legend>
            {sorted.map((p) => (
              <label key={p.id} className={`pkg-option ${pkg?.id === p.id ? 'selected' : ''}`}>
                <input type="radio" name="pkg" checked={pkg?.id === p.id} onChange={() => setForm({ ...form, unit: p.unit })} />
                <span>
                  <strong>{p.name}</strong>
                  <small>{UNIT_META[p.unit]?.label}{p.discount > 0 ? `, save ${p.discount}%` : ''}</small>
                </span>
                <span className="pkg-option-price">{money(unitPrice(car, p))}<small> / {UNIT_META[p.unit]?.noun}</small></span>
              </label>
            ))}
          </fieldset>

          <div className="two-col">
            <Field label="Pickup date"><input className="input" type="date" min={todayStr()} value={form.date} onChange={set('date')} suppressHydrationWarning /></Field>
            <Field label="Pickup time"><input className="input" type="time" value={form.time} onChange={set('time')} /></Field>
          </div>
          <Field label={`How many ${UNIT_META[pkg?.unit]?.plural || 'days'}`}>
            <input className="input" type="number" min="1" max="365" value={form.qty} onChange={set('qty')} />
          </Field>

          {pkg && (
            <div className="summary">
              <div><span>{money(unitPrice(car, pkg))} x {qtyLabel(pkg.unit, qty)}</span><strong>{money(unitPrice(car, pkg) * qty)}</strong></div>
              {range && <div className="muted small"><span>Return by</span><span>{fmtDateTime(range.end)}</span></div>}
            </div>
          )}

          {!form.date && <p className="muted small">Choose a pickup date to check this car is free.</p>}
          {past && <p className="error-text">Pickup must be in the future.</p>}
          {range && !past && availability === 'checking' && <p className="muted small" role="status">Checking availability…</p>}
          {range && !past && availability === 'free' && car.available && <p className="ok-text" role="status">This car is free for your dates.</p>}
          {busy && <p className="error-text" role="status">{car.available ? 'Not free for those dates. Try other dates.' : 'This car is not available right now.'}</p>}

          <button className="btn btn-primary btn-block" disabled={!canContinue} onClick={goCheckout}>
            {user ? 'Continue to booking' : 'Log in to continue'}
          </button>
          {!user && <p className="muted small">You can browse without an account. You need one to book.</p>}
        </aside>
      </div>
    </div>
  );
}

export default function CarDetailPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Detail />
    </Suspense>
  );
}
