'use client';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import SearchForm from '@/components/SearchForm';
import CarCard from '@/components/CarCard';
import { Empty, ErrorBox, Loading, PageHead } from '@/components/ui';
import { fetchCars } from '@/store/carsSlice';
import { addDuration, combineDateTime, fmtDateTime, qtyLabel } from '@/lib/format';

const SORTS = {
  'price-asc': (a, b) => a.dailyRate - b.dailyRate,
  'price-desc': (a, b) => b.dailyRate - a.dailyRate,
  newest: (a, b) => b.year - a.year,
};

function CarsInner() {
  const sp = useSearchParams();
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((s) => s.cars);
  const packages = useSelector((s) => s.packages.items);

  const location = sp.get('location') || '';
  const type = sp.get('type') || '';
  const date = sp.get('date') || '';
  const time = sp.get('time') || '10:00';
  const unit = sp.get('unit') || 'day';
  const qty = Math.max(1, parseInt(sp.get('qty')) || 1);
  const pkg = packages.find((p) => p.unit === unit);

  const range = useMemo(() => {
    if (!date || !pkg) return null;
    const start = combineDateTime(date, time);
    return start ? { start, end: addDuration(start, pkg, qty) } : null;
  }, [date, time, pkg, qty]);

  const [q, setQ] = useState(sp.get('q') || '');
  const load = () => dispatch(fetchCars({ location, type, ...(q ? { q } : {}), ...(range || {}) }));
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, type, q, range?.start, range?.end]);

  const [sort, setSort] = useState('price-asc');
  const list = useMemo(
    () => [...items.filter((c) => `${c.make} ${c.model}`.toLowerCase().includes(q.toLowerCase()))].sort(SORTS[sort]),
    [items, q, sort]
  );

  const initial = { location, type, date, time, unit, qty };

  return (
    <div className="container page">
      <PageHead title="Find a car">Search by city, date, car type and how long you need it.</PageHead>
      <SearchForm variant="bar" initial={initial} />

      {date && !pkg && (
        <div className="notice notice-warn">There is no {unit} package right now, so we can't check dates. Pick a different rental length.</div>
      )}
      {range && (
        <p className="result-note">
          Showing cars available from <strong>{fmtDateTime(range.start)}</strong> to <strong>{fmtDateTime(range.end)}</strong> ({qtyLabel(unit, qty)}). Final availability is checked again when you confirm.
        </p>
      )}
      {!date && <p className="result-note muted">Add a pickup date to see only the cars free for your trip.</p>}

      <div className="toolbar">
        <input className="input" type="search" placeholder="Filter by make or model" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Filter by make or model" />
        <label className="inline-field">
          <span>Sort by</span>
          <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="price-asc">Price, low to high</option>
            <option value="price-desc">Price, high to low</option>
            <option value="newest">Newest first</option>
          </select>
        </label>
        <span className="muted small">{list.length} {list.length === 1 ? 'car' : 'cars'}</span>
      </div>

      {status === 'error' && <ErrorBox message={error} onRetry={load} />}
      {status === 'loading' && !items.length && <Loading text="Finding cars…" />}
      {status === 'ready' && !list.length && (
        <Empty title="No cars match">Try another city, a different date or remove the car type filter.</Empty>
      )}
      <div className="car-grid">
        {list.map((c) => (
          <CarCard key={c.id} car={c} pkg={pkg} qty={qty} query={sp.toString()} />
        ))}
      </div>
    </div>
  );
}

export default function CarsPage() {
  return (
    <Suspense fallback={<Loading text="Loading…" />}>
      <CarsInner />
    </Suspense>
  );
}
