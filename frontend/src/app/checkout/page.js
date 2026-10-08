'use client';
import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import RequireAuth from '@/components/RequireAuth';
import CarArt from '@/components/CarArt';
import { ErrorBox, Field, Loading, PageHead } from '@/components/ui';
import { fetchCar } from '@/store/carsSlice';
import { createBooking } from '@/store/bookingsSlice';
import { PAYMENT_METHODS, UPI_APPS, WALLETS } from '@/lib/constants';
import { addDuration, combineDateTime, errMsg, fmtDateTime, money, qtyLabel, unitPrice, carImageSrc } from '@/lib/format';

function CheckoutInner() {
  const sp = useSearchParams();
  const dispatch = useDispatch();
  const carId = sp.get('car');
  const unit = sp.get('unit') || 'day';
  const qty = Math.max(1, parseInt(sp.get('qty')) || 1);
  const date = sp.get('date');
  const time = sp.get('time') || '10:00';

  const { current, currentStatus, currentError } = useSelector((s) => s.cars);
  const packages = useSelector((s) => s.packages.items);
  const pkg = packages.find((p) => p.unit === unit);
  const car = current && String(current.id) === String(carId) ? current : null;

  const [method, setMethod] = useState('card');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [upiApp, setUpiApp] = useState(UPI_APPS[0]);
  const [walletName, setWalletName] = useState(WALLETS[0]);
  const [walletPhone, setWalletPhone] = useState('');

  const [formErrors, setFormErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState('');
  const [done, setDone] = useState(null);

  useEffect(() => {
    if (carId) dispatch(fetchCar(carId));
  }, [dispatch, carId]);

  const range = useMemo(() => {
    if (!date || !pkg) return null;
    const start = combineDateTime(date, time);
    return start ? { start, end: addDuration(start, pkg, qty) } : null;
  }, [date, time, pkg, qty]);

  if (done)
    return (
      <div className="container page narrow">
        <div className="card success-card">
          <h1 className="h2">Booking confirmed</h1>
          <p>Your {done.carName} is reserved. Booking reference <strong>{done.id}</strong>.</p>
          <dl className="specs">
            <div><dt>Pickup</dt><dd>{fmtDateTime(done.startDate)} in {done.pickupLocation}</dd></div>
            <div><dt>Return by</dt><dd>{fmtDateTime(done.endDate)}</dd></div>
            <div><dt>Amount</dt><dd>{money(done.amount)}</dd></div>
            <div><dt>Payment method</dt><dd>{done.paymentMethod || method.toUpperCase()}</dd></div>
          </dl>
          <div className="row-actions">
            <Link href="/bookings" className="btn btn-primary">View my bookings</Link>
            <Link href="/cars" className="btn btn-ghost">Keep browsing</Link>
          </div>
        </div>
      </div>
    );

  if (!carId || !date)
    return (
      <div className="container page narrow">
        <ErrorBox message="Choose a car and pickup date before confirming." />
        <p><Link href="/cars" className="text-link">Find a car</Link></p>
      </div>
    );
  if (currentStatus === 'error' && !car) return <div className="container page"><ErrorBox message={currentError} /></div>;
  if (!car || !pkg) return <Loading text="Preparing your booking…" />;

  const estimate = unitPrice(car, pkg) * qty;

  function validatePayment() {
    const errors = {};
    if (method === 'card') {
      if (!cardName.trim()) errors.cardName = 'Enter cardholder name.';
      const cleanedNum = cardNumber.replace(/\s+/g, '');
      if (!cleanedNum || cleanedNum.length < 12) errors.cardNumber = 'Enter a valid 16-digit card number.';
      if (!cardExp.trim() || !cardExp.includes('/')) errors.cardExp = 'Enter expiry (MM/YY).';
      if (!cardCvv.trim() || cardCvv.length < 3) errors.cardCvv = 'Enter 3 or 4 digit CVV.';
    } else if (method === 'upi') {
      const trimmed = upiId.trim();
      const upiRegex = /^[a-zA-Z0-9.\-_]{2,64}@[a-zA-Z0-9.\-_]{2,32}$/;
      if (!trimmed) {
        errors.upiId = 'Enter your UPI ID / VPA.';
      } else if (!trimmed.includes('@')) {
        errors.upiId = 'UPI ID must contain "@" (e.g. username@okhdfcbank or 9876543210@upi).';
      } else if (!upiRegex.test(trimmed)) {
        errors.upiId = 'Enter a valid UPI ID format (e.g. username@bank or mobile@upi).';
      }
    } else if (method === 'wallet') {
      if (!walletPhone.trim() || walletPhone.length < 10) errors.walletPhone = 'Enter a valid 10-digit mobile number.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function pay(e) {
    e.preventDefault();
    setServerError('');
    if (new Date(range.start) < new Date()) {
      setServerError('Pickup must be in the future. Go back and pick a new time.');
      return;
    }
    if (!validatePayment()) {
      return;
    }
    setBusy(true);
    try {
      const b = await dispatch(
        createBooking({
          carId: car.id, packageId: pkg.id, quantity: qty, startDate: range.start, endDate: range.end,
          pickupLocation: car.location, paymentMethod: method.toUpperCase(),
        })
      ).unwrap();
      setDone(b);
    } catch (err) {
      setServerError(errMsg(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container page">
      <PageHead title="Review and pay">Select your payment method and confirm your reservation.</PageHead>
      <div className="checkout-grid">
        <form className="card" onSubmit={pay} noValidate>
          <h2 className="h3" style={{ marginBottom: '1rem' }}>Payment method</h2>
          <div className="method-list">
            {PAYMENT_METHODS.map((m) => (
              <label key={m.id} className={`method ${method === m.id ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value={m.id}
                  checked={method === m.id}
                  onChange={() => {
                    setMethod(m.id);
                    setFormErrors({});
                  }}
                />
                <div>
                  <strong>{m.label}</strong>
                  <small>{m.hint}</small>
                </div>
              </label>
            ))}
          </div>

          {method === 'card' && (
            <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--line)', paddingTop: '1rem' }}>
              <Field label="Cardholder name" error={formErrors.cardName}>
                <input
                  className="input"
                  placeholder="e.g. Rahul Sharma"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
              </Field>
              <Field label="Card number" error={formErrors.cardNumber} hint="16 digits card number">
                <input
                  className="input"
                  placeholder="4532 0123 4567 8910"
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
              </Field>
              <div className="two-col">
                <Field label="Expiry date" error={formErrors.cardExp} hint="MM/YY">
                  <input
                    className="input"
                    placeholder="MM/YY"
                    maxLength={5}
                    value={cardExp}
                    onChange={(e) => setCardExp(e.target.value)}
                  />
                </Field>
                <Field label="CVV" error={formErrors.cardCvv} hint="3 or 4 digits">
                  <input
                    className="input"
                    type="password"
                    placeholder="•••"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                  />
                </Field>
              </div>
            </div>
          )}

          {method === 'upi' && (
            <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--line)', paddingTop: '1rem' }}>
              <div className="field">
                <span>Popular UPI Apps</span>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.35rem', marginBottom: '0.75rem' }}>
                  {UPI_APPS.map((app) => (
                    <button
                      type="button"
                      key={app}
                      className={`btn btn-sm ${upiApp === app ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => {
                        setUpiApp(app);
                        const handle = { 'Google Pay': 'okaxis', 'PhonePe': 'ybl', 'Paytm': 'paytm', 'BHIM': 'upi' }[app] || 'upi';
                        if (!upiId || !upiId.includes('@')) {
                          const base = upiId.trim() || 'user';
                          setUpiId(`${base}@${handle}`);
                        } else {
                          const [base] = upiId.split('@');
                          setUpiId(`${base || 'user'}@${handle}`);
                        }
                        if (formErrors.upiId) setFormErrors((prev) => ({ ...prev, upiId: '' }));
                      }}
                    >
                      {app}
                    </button>
                  ))}
                </div>
              </div>
              <Field label="UPI ID / VPA" error={formErrors.upiId} hint="e.g. username@okhdfcbank or 9876543210@upi">
                <input
                  className="input"
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={(e) => {
                    setUpiId(e.target.value);
                    if (formErrors.upiId) setFormErrors((prev) => ({ ...prev, upiId: '' }));
                  }}
                />
              </Field>
            </div>
          )}

          {method === 'wallet' && (
            <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--line)', paddingTop: '1rem' }}>
              <Field label="Select Wallet" error={formErrors.walletName}>
                <select
                  className="input"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                >
                  {WALLETS.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </Field>
              <Field label="Linked mobile number" error={formErrors.walletPhone} hint="10-digit mobile registered with wallet">
                <input
                  className="input"
                  placeholder="9876543210"
                  maxLength={10}
                  value={walletPhone}
                  onChange={(e) => setWalletPhone(e.target.value)}
                />
              </Field>
            </div>
          )}

          {method === 'cash' && (
            <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--line)', paddingTop: '1rem' }}>
              <div className="notice" style={{ margin: 0, display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>💵</span>
                <div>
                  <strong>Pay offline at pickup counter</strong>
                  <p className="small muted" style={{ margin: '0.25rem 0 0' }}>
                    No upfront online payment required. You can pay {money(estimate)} via cash, card, or UPI when you arrive to pick up the vehicle at <strong>{car.location}</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {serverError && <div className="notice notice-error" role="alert">{serverError}</div>}
          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Confirming booking…' : method === 'cash' ? `Reserve car (Pay ${money(estimate)} at pickup)` : `Pay ${money(estimate)} & confirm`}
          </button>
        </form>

        <aside className="card order">
          <div className="order-art">
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
          <h2 className="h3">{car.make} {car.model}</h2>
          <dl className="specs tight">
            <div><dt>Pickup</dt><dd>{fmtDateTime(range.start)}</dd></div>
            <div><dt>Location</dt><dd>{car.location}</dd></div>
            <div><dt>Return by</dt><dd>{fmtDateTime(range.end)}</dd></div>
            <div><dt>Package</dt><dd>{pkg.name}</dd></div>
          </dl>
          <div className="summary">
            <div><span>{money(unitPrice(car, pkg))} x {qtyLabel(pkg.unit, qty)}</span><strong>{money(estimate)}</strong></div>
            <div className="total"><span>Estimated total</span><strong>{money(estimate)}</strong></div>
            <p className="muted small">This is an estimate. The backend calculates and returns the final amount when you confirm.</p>
          </div>
          <p className="muted small">You can change or cancel this booking from My bookings before pickup.</p>
        </aside>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <RequireAuth>
      <Suspense fallback={<Loading />}>
        <CheckoutInner />
      </Suspense>
    </RequireAuth>
  );
}

