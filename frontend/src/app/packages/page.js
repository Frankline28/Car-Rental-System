'use client';
import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { Empty, Loading, PageHead } from '@/components/ui';
import { fetchCars } from '@/store/carsSlice';
import { UNIT_META, UNIT_ORDER } from '@/lib/constants';
import { money, unitPrice } from '@/lib/format';

export default function PackagesPage() {
  const dispatch = useDispatch();
  const cars = useSelector((s) => s.cars.items);
  const { items: packages, status } = useSelector((s) => s.packages);

  useEffect(() => {
    dispatch(fetchCars({}));
  }, [dispatch]);

  const pkgs = useMemo(() => [...packages].sort((a, b) => UNIT_ORDER.indexOf(a.unit) - UNIT_ORDER.indexOf(b.unit)), [packages]);
  const sample = useMemo(() => [...cars].sort((a, b) => a.dailyRate - b.dailyRate), [cars]);

  return (
    <div className="container page">
      <PageHead title="Rental packages">Rent by the hour, day, week or month. Longer rentals cost less per day.</PageHead>
      {status === 'loading' && !pkgs.length && <Loading />}
      {status === 'ready' && !pkgs.length && <Empty title="No packages yet">Check back soon.</Empty>}

      <div className="pkg-grid">
        {pkgs.map((p) => (
          <article key={p.id} className="pkg-card">
            <h3>{p.name}</h3>
            <p className="pkg-unit">{UNIT_META[p.unit]?.label}</p>
            <p className="muted small">{p.description}</p>
            {p.discount > 0 && <span className="tag tag-confirmed">Save {p.discount}%</span>}
            <Link href={`/cars?unit=${p.unit}`} className="btn btn-ghost btn-sm">Find a car for this package</Link>
          </article>
        ))}
      </div>

      {!!sample.length && !!pkgs.length && (
        <>
          <h2 className="h3 spaced">What each car costs</h2>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Car</th>
                  {pkgs.map((p) => <th key={p.id}>Per {UNIT_META[p.unit]?.noun}</th>)}
                </tr>
              </thead>
              <tbody>
                {sample.map((c) => (
                  <tr key={c.id}>
                    <td><Link className="text-link" href={`/cars/${c.id}`}>{c.make} {c.model}</Link></td>
                    {pkgs.map((p) => <td key={p.id}>{money(unitPrice(c, p))}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
