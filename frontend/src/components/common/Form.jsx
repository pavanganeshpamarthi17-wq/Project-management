export function FormGroup({ label, error, hint, children, required }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
          {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}
      {children}
      {error && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{error}</span>}
      {hint && !error && <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{hint}</span>}
    </div>
  );
}

const inputBase = {
  width: '100%', padding: '10px 14px',
  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
  borderRadius: '9px', color: 'var(--text)', fontSize: '14px',
  outline: 'none', transition: 'border-color 0.2s ease',
  fontFamily: 'var(--font)'
};

export function Input({ error, ...props }) {
  return (
    <input
      style={{
        ...inputBase,
        ...(error ? { borderColor: 'var(--danger)' } : {})
      }}
      onFocus={e => e.target.style.borderColor = 'var(--primary)'}
      onBlur={e => e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border)'}
      {...props}
    />
  );
}

export function Textarea({ error, rows = 4, ...props }) {
  return (
    <textarea
      rows={rows}
      style={{
        ...inputBase, resize: 'vertical', lineHeight: '1.6',
        ...(error ? { borderColor: 'var(--danger)' } : {})
      }}
      onFocus={e => e.target.style.borderColor = 'var(--primary)'}
      onBlur={e => e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border)'}
      {...props}
    />
  );
}

export function Select({ error, children, ...props }) {
  return (
    <select
      style={{
        ...inputBase, appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238892b0' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
        paddingRight: '36px', cursor: 'pointer',
        ...(error ? { borderColor: 'var(--danger)' } : {})
      }}
      onFocus={e => e.target.style.borderColor = 'var(--primary)'}
      onBlur={e => e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border)'}
      {...props}
    >
      {children}
    </select>
  );
}
