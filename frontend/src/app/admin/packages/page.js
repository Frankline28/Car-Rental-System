'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '@/components/Modal';
import { Empty, ErrorBox, Field, Loading, PageHead } from '@/components/ui';
import { fetchPackages, removePackage, savePackage } from '@/store/packagesSlice';
import { UNIT_META, UNIT_ORDER } from '@/lib/constants';
import { errMsg } from '@/lib/format';

function PackageForm({ pkg, existing, onClose }) {
  const dispatch = useDispatch();
  const [f, setF] = useState(pkg || { name: '', unit: 'day', discount: 0, description: '' });
  const [errs, setErrs] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const v = {};
    if (!f.name.trim()) v.name = 'Enter a package name.';
    if (existing.some((p) => p.unit === f.unit && p.id !== pkg?.id)) v.unit = 'A package for this duration already exists. Edit it instead.';
    if (!(+f.discount >= -100 && +f.discount < 100)) v.discount = 'Enter a number between -100 and 99.';
    setErrs(v);
    if (Object.keys(v).length) return;
    setBusy(true);
    try {
      await dispatch(savePackage({ id: pkg?.id, data: { ...f, discount: +f.discount, hours: UNIT_META[f.unit].hours } })).unwrap();
      onClose();
    } catch (err) {
      setServerError(errMsg(err));
      setBusy(false);
    }
  }

  return (
    <Modal title={pkg ? `Edit ${pkg.name}` : 'Add a rental package'} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <Field label="Package name" error={errs.name}><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
        <Field label="Rental length" error={errs.unit} hint="Customers pick how many hours, days, weeks or months.">
          <select className="input" value={f.unit} onChange={(e) => setF({ ...f, unit: e.target.value })}>
            {UNIT_ORDER.map((u) => <option key={u} value={u}>{UNIT_META[u].label}</option>)}
          </select>
        </Field>
        <Field label="Discount (%)" error={errs.discount} hint="Applied to the car rate for this package. A negative number adds a premium.">
          <input className="input" type="number" value={f.discount} onChange={(e) => setF({ ...f, discount: e.target.value })} />
        </Field>
        <Field label="Description"><textarea className="input" rows="2" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
        {serverError && <div className="notice notice-error" role="alert">{serverError}</div>}
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : pkg ? 'Save changes' : 'Add package'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminPackages() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((s) => s.packages);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [delError, setDelError] = useState('');

  useEffect(() => {
    dispatch(fetchPackages());
  }, [dispatch]);

  const rows = [...items].sort((a, b) => UNIT_ORDER.indexOf(a.unit) - UNIT_ORDER.indexOf(b.unit));

  async function confirmDelete() {
    try {
      await dispatch(removePackage(deleting.id)).unwrap();
      setDeleting(null);
    } catch (e) {
      setDelError(errMsg(e));
    }
  }

  return (
    <>
      <PageHead title="Rental packages" action={<button className="btn btn-primary" onClick={() => setEditing('new')}>Add a package</button>}>
        Set the rental lengths customers can choose and any discount that goes with them.
      </PageHead>
      {status === 'error' && <ErrorBox message={error} onRetry={() => dispatch(fetchPackages())} />}
      {status === 'loading' && !items.length && <Loading />}
      {status === 'ready' && !rows.length && <Empty title="No packages">Add an hourly, daily, weekly or monthly package.</Empty>}
      {!!rows.length && (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Package</th><th>Length</th><th>Discount</th><th>Description</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td>{UNIT_META[p.unit]?.label}</td>
                  <td>{p.discount > 0 ? `${p.discount}% off` : p.discount < 0 ? `${-p.discount}% premium` : 'None'}</td>
                  <td className="muted">{p.description}</td>
                  <td className="actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(p)}>Edit</button>
                    <button className="btn btn-danger-ghost btn-sm" onClick={() => { setDeleting(p); setDelError(''); }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing && <PackageForm pkg={editing === 'new' ? null : editing} existing={items} onClose={() => setEditing(null)} />}
      {deleting && (
        <Modal title={`Delete ${deleting.name}?`} onClose={() => setDeleting(null)}>
          <p>Packages with booking history cannot be deleted.</p>
          {delError && <div className="notice notice-error" role="alert">{delError}</div>}
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setDeleting(null)}>Keep package</button>
            <button className="btn btn-danger" onClick={confirmDelete}>Delete package</button>
          </div>
        </Modal>
      )}
    </>
  );
}
