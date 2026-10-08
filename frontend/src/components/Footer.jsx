import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-row">
        <div>
          <strong>Laneline Car Rentals</strong>
          <p className="muted-light small">Rent by the hour, day, week or month.</p>
        </div>
        <nav className="footer-links" aria-label="Footer">
          <Link href="/cars">Browse cars</Link>
          <Link href="/packages">Rental packages</Link>
          <Link href="/login">Log in</Link>
        </nav>
      </div>
    </footer>
  );
}
