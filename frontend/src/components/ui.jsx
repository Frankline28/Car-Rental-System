export function Loading({ text = 'Loading…' }) {
  return (
    <div className="page-state" role="status">
      {text}
    </div>
  );
}

export function ErrorBox({ message, onRetry }) {
  return (
    <div className="notice notice-error" role="alert">
      <span>{message}</span>
      {onRetry && (
        <button className="btn btn-ghost btn-sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function Empty({ title, children }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      {children && <p>{children}</p>}
    </div>
  );
}

export function Field({ label, error, hint, children, className = '' }) {
  return (
    <label className={`field ${className}`}>
      <span>{label}</span>
      {children}
      {hint && <small className="hint">{hint}</small>}
      {error && <small className="error-text">{error}</small>}
    </label>
  );
}

export function StatusTag({ status }) {
  return <span className={`tag tag-${String(status).toLowerCase().replace(/\s+/g, '-')}`}>{status}</span>;
}

export function PageHead({ title, children, action }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {children && <p className="muted">{children}</p>}
      </div>
      {action}
    </div>
  );
}
