'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '@/components/Modal';
import { Empty, ErrorBox, Field, Loading, PageHead } from '@/components/ui';
import { fetchUsers, removeUser, saveUser } from '@/store/usersSlice';
import { errMsg } from '@/lib/format';

function UserForm({ user, onClose }) {
  const dispatch = useDispatch();
  const [f, setF] = useState({ name: user.name, email: user.email, phone: user.phone || '', status: user.status || 'active' });
  const [errs, setErrs] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    const v = {};
    if (f.name.trim().length < 2) v.name = 'Enter a name.';
    if (!/^\S+@\S+\.\S+$/.test(f.email)) v.email = 'Enter a valid email.';
    setErrs(v);
    if (Object.keys(v).length) return;
    setBusy(true);
    try {
      await dispatch(saveUser({ id: user.id, data: { name: f.name.trim(), email: f.email.trim(), phone: f.phone, status: f.status } })).unwrap();
      onClose();
    } catch (err) {
      setServerError(errMsg(err));
      setBusy(false);
    }
  }

  return (
    <Modal title={`Edit ${user.name}`} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <Field label="Full name" error={errs.name}><input className="input" value={f.name} onChange={set('name')} /></Field>
        <Field label="Email" error={errs.email}><input className="input" type="email" value={f.email} onChange={set('email')} /></Field>
        <Field label="Mobile number"><input className="input" type="tel" value={f.phone || ''} onChange={set('phone')} /></Field>
        <Field label="Account"><select className="input" value={f.status} onChange={set('status')}><option value="active">Active</option><option value="blocked">Blocked</option></select></Field>
        {serverError && <div className="notice notice-error" role="alert">{serverError}</div>}
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminUsers() {
  const dispatch = useDispatch();
  const me = useSelector((s) => s.auth.user);
  const { items, status, error } = useSelector((s) => s.users);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [delError, setDelError] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const rows = items.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase()));

  async function confirmDelete() {
    try {
      await dispatch(removeUser(deleting.id)).unwrap();
      setDeleting(null);
    } catch (e) {
      setDelError(errMsg(e));
    }
  }

  return (
    <>
      <PageHead title="Users">
        Review accounts and update contact details or account status.
      </PageHead>
      <div className="toolbar">
        <input className="input" type="search" placeholder="Search by name or email" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search users" />
      </div>
      {status === 'error' && <ErrorBox message={error} onRetry={() => dispatch(fetchUsers())} />}
      {status === 'loading' && !items.length && <Loading />}
      {status === 'ready' && !rows.length && <Empty title="No users found" />}
      {!!rows.length && (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Account</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id}>
                  <td><strong>{u.name}</strong><br /><span className="muted small">{u.phone}</span></td>
                  <td>{u.email}</td>
                  <td>{/admin/i.test(u.role) ? 'Administrator' : 'Customer'}</td>
                  <td><span className={`tag ${u.status === 'blocked' ? 'tag-cancelled' : 'tag-confirmed'}`}>{u.status === 'blocked' ? 'Blocked' : 'Active'}</span></td>
                  <td className="actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(u)}>Edit</button>
                    {u.id !== me?.id && <button className="btn btn-danger-ghost btn-sm" onClick={() => { setDeleting(u); setDelError(''); }}>Delete</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing && <UserForm user={editing} onClose={() => setEditing(null)} />}
      {deleting && (
        <Modal title={`Delete ${deleting.name}?`} onClose={() => setDeleting(null)}>
          <p>Accounts with booking history may be protected from deletion. You can deactivate an account from its edit form.</p>
          {delError && <div className="notice notice-error" role="alert">{delError}</div>}
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setDeleting(null)}>Keep user</button>
            <button className="btn btn-danger" onClick={confirmDelete}>Delete user</button>
          </div>
        </Modal>
      )}
    </>
  );
}
