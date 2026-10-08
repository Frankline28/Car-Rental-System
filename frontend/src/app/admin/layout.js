'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import RequireAuth from '@/components/RequireAuth';

const LINKS = [
  ['/admin', 'Dashboard'],
  ['/admin/cars', 'Cars'],
  ['/admin/packages', 'Rental packages'],
  ['/admin/bookings', 'Bookings'],
  ['/admin/users', 'Users'],
];

export default function AdminLayout({ children }) {
  const path = usePathname();
  return (
    <RequireAuth roles={['admin']}>
      <div className="container admin-shell">
        <nav className="admin-nav" aria-label="Administrator">
          {LINKS.map(([href, label]) => (
            <Link key={href} href={href} className={path === href ? 'active' : ''}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="admin-main">{children}</div>
      </div>
    </RequireAuth>
  );
}
