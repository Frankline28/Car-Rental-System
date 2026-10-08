import Link from 'next/link';
import CarArt from './CarArt';
import { money, unitPrice, qtyLabel, carImageSrc } from '@/lib/format';

export default function CarCard({ car, pkg, qty = 1, query = '' }) {
  const href = `/cars/${car.id}${query ? `?${query}` : ''}`;
  const price = pkg ? unitPrice(car, pkg) * qty : car.dailyRate;
  return (
    <article className="car-card">
      <Link href={href} className="car-art" aria-label={`${car.make} ${car.model} details`}>
        {car.image ? (
          <img
            src={carImageSrc(car.image)}
            alt={`${car.make} ${car.model}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <CarArt type={car.type} color={car.color} />
        )}
        {!car.available && <span className="tag tag-cancelled car-flag">Unavailable</span>}
      </Link>
      <div className="car-body">
        <div className="car-title">
          <h3>
            {car.make} {car.model}
          </h3>
          <span className="tag">{car.type}</span>
        </div>
        <ul className="spec-row">
          <li>{car.year}</li>
          <li>{car.seats} seats</li>
          <li>{car.transmission}</li>
          <li>{car.fuel}</li>
        </ul>
        <p className="muted small">Pickup in {car.location}</p>
        <div className="car-foot">
          <div className="price">
            <strong>{money(price)}</strong>
            <span>{pkg ? `for ${qtyLabel(pkg.unit, qty)}` : 'per day'}</span>
          </div>
          <Link href={href} className="btn btn-primary btn-sm">
            View and book
          </Link>
        </div>
      </div>
    </article>
  );
}
