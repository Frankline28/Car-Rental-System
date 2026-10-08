'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import SearchForm from '@/components/SearchForm';
import CarArt from '@/components/CarArt';
import CarCard from '@/components/CarCard';
import { Loading } from '@/components/ui';
import { fetchCars } from '@/store/carsSlice';
import { CAR_TYPES, TYPE_COLORS, UNIT_ORDER, UNIT_META } from '@/lib/constants';
import { money, unitPrice } from '@/lib/format';

export default function Home() {
  const dispatch = useDispatch();
  const { items: cars, status } = useSelector((s) => s.cars);
  const packages = useSelector((s) => s.packages.items);

  useEffect(() => {
    dispatch(fetchCars({}));
  }, [dispatch]);

  const featured = cars.filter((c) => c.available).slice(0, 6);
  const cheapest = cars.length ? Math.min(...cars.map((c) => c.dailyRate)) : 0;
  const sortedPkgs = [...packages].sort((a, b) => UNIT_ORDER.indexOf(a.unit) - UNIT_ORDER.indexOf(b.unit));

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <h1>A car for the hour, the weekend or the month.</h1>
          <p className="hero-sub">Pick a city, a date and how long you need it. We show only the cars that are free.</p>
        </div>
        <CarArt type="SUV" color="#F4F5F1" className="hero-car" title="" />
      </section>

      <div className="container ticket-wrap">
        <SearchForm variant="ticket" />
      </div>

      <section className="section container">
        <div className="section-head">
          <h2>Pick a body type</h2>
          <Link href="/cars" className="text-link">See the full fleet</Link>
        </div>
        <div className="type-grid">
          {CAR_TYPES.map((t) => {
            const n = cars.filter((c) => c.type === t).reduce((s, c) => s + (c.quantity || 1), 0);
            return (
              <Link key={t} href={`/cars?type=${t}`} className="type-tile">
                <CarArt type={t} color={TYPE_COLORS[t]} title="" />
                <strong>{t}</strong>
                <span className="muted small">{n ? `${n} in the fleet` : 'Browse'}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <h2>Rental packages</h2>
          <Link href="/packages" className="text-link">Compare packages</Link>
        </div>
        <div className="pkg-grid">
          {sortedPkgs.map((p) => (
            <article key={p.id} className="pkg-card">
              <h3>{p.name}</h3>
              <p className="pkg-unit">{UNIT_META[p.unit]?.label}</p>
              {cheapest > 0 && (
                <p className="pkg-price">
                  <strong>{money(unitPrice({ dailyRate: cheapest }, p))}</strong> per {UNIT_META[p.unit]?.noun}
                </p>
              )}
              <p className="muted small">{p.description}</p>
              {p.discount > 0 && <span className="tag tag-confirmed">Save {p.discount}%</span>}
            </article>
          ))}
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <h2>Ready to drive</h2>
          <Link href="/cars" className="text-link">Browse all cars</Link>
        </div>
        {status === 'loading' && !cars.length ? (
          <Loading text="Loading cars…" />
        ) : (
          <div className="car-grid">
            {featured.map((c) => (
              <CarCard key={c.id} car={c} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
