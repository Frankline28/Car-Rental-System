'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Field } from './ui';
import { CAR_TYPES, UNIT_META, UNIT_ORDER } from '@/lib/constants';

const blank = { location: '', type: '', date: '', time: '10:00', unit: 'day', qty: 1 };

export default function SearchForm({ initial, variant = 'ticket', target = '/cars' }) {
  const router = useRouter();
  const packages = useSelector((s) => s.packages.items);
  const locations = useSelector((s) => s.locations.items);
  const units = UNIT_ORDER.filter((u) => !packages.length || packages.some((p) => p.unit === u));
  const [f, setF] = useState({ ...blank, ...initial });

  const key = JSON.stringify(initial || {});
  useEffect(() => {
    setF((prev) => ({ ...prev, ...initial }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  function submit(e) {
    e.preventDefault();
    const qs = new URLSearchParams();
    Object.entries(f).forEach(([k, v]) => {
      if (v !== '' && v != null) qs.set(k, v);
    });
    router.push(`${target}?${qs.toString()}`);
  }

  return (
    <form className={`search search-${variant}`} onSubmit={submit}>
      <div className="search-fields">
        <Field label="Pickup city">
          <select className="input" value={f.location} onChange={set('location')}>
            <option value="">Any city</option>
            {locations.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </Field>
        <Field label="Pickup date">
          <input className="input" type="date" value={f.date} onChange={set('date')} suppressHydrationWarning />
        </Field>
        <Field label="Pickup time">
          <input className="input" type="time" value={f.time} onChange={set('time')} />
        </Field>
        <Field label="Car type">
          <select className="input" value={f.type} onChange={set('type')}>
            <option value="">Any type</option>
            {CAR_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="Rent by the">
          <select className="input" value={f.unit} onChange={set('unit')}>
            {units.map((u) => (
              <option key={u} value={u}>
                {UNIT_META[u].noun}
              </option>
            ))}
          </select>
        </Field>
        <Field label={`How many ${UNIT_META[f.unit]?.plural || 'days'}`}>
          <input className="input" type="number" min="1" max="365" value={f.qty} onChange={set('qty')} />
        </Field>
      </div>
      <div className="search-action">
        <button className="btn btn-amber" type="submit">
          Search cars
        </button>
      </div>
    </form>
  );
}
