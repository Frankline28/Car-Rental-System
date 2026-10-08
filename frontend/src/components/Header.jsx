'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/store/authSlice';

export default function Header() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const path = usePathname();
  const [open, setOpen] = useState(false);

  const link = (href, label) => (
    <Link href={href} className={path === href || (href !== '/' && path.startsWith(href)) ? 'active' : ''} onClick={() => setOpen(false)}>
      {label}
    </Link>
  );

  return (
    <header className="site-header">
      <div className="container header-row">
        <Link href="/" className="brand" aria-label="Laneline home">
          <span className="brand-mark" aria-hidden="true" />
          Laneline
        </Link>
        <button className="menu-btn" aria-expanded={open} aria-controls="site-nav" onClick={() => setOpen(!open)}>
          Menu
        </button>
        <nav id="site-nav" className={`site-nav ${open ? 'open' : ''}`}>
          {link('/cars', 'Cars')}
          {link('/packages', 'Rental packages')}
          {user?.role === 'customer' && link('/bookings', 'My bookings')}
          {user?.role === 'admin' && link('/admin', 'Admin')}
          <span className="nav-spacer" />
          {user ? (
            <>
              <span className="nav-user">{user.name}</span>
              <button
                className="btn btn-ghost-light btn-sm"
                onClick={() => {
                  dispatch(logout());
                  setOpen(false);
                  router.push('/');
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              {link('/login', 'Log in')}
              <Link href="/register" className="btn btn-amber btn-sm" onClick={() => setOpen(false)}>
                Create account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
