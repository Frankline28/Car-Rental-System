'use client';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';

/** Wrap a page to make it login-only. Pass roles={['admin']} to restrict by role. */
export default function RequireAuth({ roles, children }) {
  const { user, hydrated } = useSelector((s) => s.auth);
  const router = useRouter();
  const allowed = !!user && (!roles || roles.includes(user.role));

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      router.replace(`/login?next=${next}`);
    } else if (!allowed) {
      router.replace('/');
    }
  }, [hydrated, user, allowed, router]);

  if (!hydrated || !allowed) return <div className="page-state" role="status">Checking your session…</div>;
  return children;
}
