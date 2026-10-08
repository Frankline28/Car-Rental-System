'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { Field } from '@/components/ui';
import { clearAuthError, register } from '@/store/authSlice';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, status, error } = useSelector((s) => s.auth);
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [errs, setErrs] = useState({});

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);
  useEffect(() => {
    if (user) router.replace(user.role === 'admin' ? '/admin' : '/');
  }, [user, router]);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  function submit(e) {
    e.preventDefault();
    const v = {};
    if (f.name.trim().length < 2) v.name = 'Enter your full name.';
    if (!/^\S+@\S+\.\S+$/.test(f.email)) v.email = 'Enter a valid email address.';
    if (!/^\d{10}$/.test(f.phone.replace(/\s/g, ''))) v.phone = 'Enter a 10-digit mobile number.';
    if (f.password.length < 8) v.password = 'Use at least 8 characters.';
    if (f.confirm !== f.password) v.confirm = 'Passwords do not match.';
    setErrs(v);
    if (Object.keys(v).length) return;
    dispatch(register({ name: f.name.trim(), email: f.email, phone: f.phone, password: f.password }));
  }

  return (
    <div className="container auth-page">
      <form className="card auth-card" onSubmit={submit} noValidate>
        <h1 className="h2">Create your account</h1>
        <p className="muted small">An account lets you book cars and manage your rentals.</p>
        {error && <div className="notice notice-error" role="alert">{error}</div>}
        <Field label="Full name" error={errs.name}><input className="input" autoComplete="name" value={f.name} onChange={set('name')} /></Field>
        <Field label="Email" error={errs.email}><input className="input" type="email" autoComplete="email" value={f.email} onChange={set('email')} /></Field>
        <Field label="Mobile number" error={errs.phone}><input className="input" type="tel" autoComplete="tel" value={f.phone} onChange={set('phone')} /></Field>
        <Field label="Password" error={errs.password}><input className="input" type="password" autoComplete="new-password" value={f.password} onChange={set('password')} /></Field>
        <Field label="Confirm password" error={errs.confirm}><input className="input" type="password" autoComplete="new-password" value={f.confirm} onChange={set('confirm')} /></Field>
        <button className="btn btn-primary btn-block" disabled={status === 'loading'}>
          {status === 'loading' ? 'Creating account…' : 'Create account'}
        </button>
        <p className="muted small">Already registered? <Link className="text-link" href="/login">Log in</Link></p>
      </form>
    </div>
  );
}
