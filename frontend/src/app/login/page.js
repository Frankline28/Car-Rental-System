'use client';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { Field } from '@/components/ui';
import { clearAuthError, login } from '@/store/authSlice';
import { USE_MOCK } from '@/lib/api';

function LoginForm() {
  const dispatch = useDispatch();
  const router = useRouter();
  const sp = useSearchParams();
  const { user, status, error } = useSelector((s) => s.auth);
  const [f, setF] = useState({ email: '', password: '' });
  const [errs, setErrs] = useState({});

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      const next = sp.get('next');
      router.replace(next && next.startsWith('/') ? next : user.role === 'admin' ? '/admin' : '/');
    }
  }, [user, sp, router]);

  function submit(e) {
    e.preventDefault();
    const v = {};
    if (!/^\S+@\S+\.\S+$/.test(f.email)) v.email = 'Enter a valid email address.';
    if (!f.password) v.password = 'Enter your password.';
    setErrs(v);
    if (Object.keys(v).length) return;
    dispatch(login(f));
  }

  return (
    <div className="container auth-page">
      <form className="card auth-card" onSubmit={submit} noValidate>
        <h1 className="h2">Log in</h1>
        {error && <div className="notice notice-error" role="alert">{error}</div>}
        <Field label="Email" error={errs.email}>
          <input className="input" type="email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        </Field>
        <Field label="Password" error={errs.password}>
          <input className="input" type="password" autoComplete="current-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        </Field>
        <button className="btn btn-primary btn-block" disabled={status === 'loading'}>
          {status === 'loading' ? 'Logging in…' : 'Log in'}
        </button>
        <p className="muted small">
          New here? <Link className="text-link" href="/register">Create an account</Link>
        </p>
        {USE_MOCK && (
          <div className="demo-box">
            <strong>Demo accounts</strong>
            <button type="button" className="link-btn" onClick={() => setF({ email: 'customer@carrental.com', password: 'customer123' })}>Fill in customer login</button>
            <button type="button" className="link-btn" onClick={() => setF({ email: 'admin@carrental.com', password: 'admin123' })}>Fill in administrator login</button>
          </div>
        )}
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
