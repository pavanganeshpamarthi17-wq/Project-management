// Button.jsx
export function Button({ children, variant = 'primary', size = 'md', loading, icon, fullWidth, ...props }) {
  const styles = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: '7px', fontFamily: 'var(--font)', fontWeight: 600, cursor: props.disabled || loading ? 'not-allowed' : 'pointer',
    border: 'none', borderRadius: '9px', transition: 'all 0.2s ease',
    width: fullWidth ? '100%' : 'auto',
    opacity: props.disabled || loading ? 0.6 : 1,
    ...(size === 'sm' ? { padding: '7px 14px', fontSize: '13px' } :
        size === 'lg' ? { padding: '13px 28px', fontSize: '15px' } :
        { padding: '10px 20px', fontSize: '14px' }),
    ...(variant === 'primary' ? {
      background: 'var(--primary)', color: 'white', boxShadow: '0 2px 8px rgba(79,142,247,0.3)'
    } : variant === 'secondary' ? {
      background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border)'
    } : variant === 'danger' ? {
      background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid rgba(248,113,113,0.2)'
    } : variant === 'ghost' ? {
      background: 'transparent', color: 'var(--text-muted)', padding: '7px'
    } : {})
  };

  return (
    <button style={styles} {...props}>
      {loading ? <Spinner size={14} /> : icon}
      {children}
    </button>
  );
}

export function Badge({ children, color, bg }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
      color: color || 'var(--text-muted)', background: bg || 'var(--bg-hover)'
    }}>
      {children}
    </span>
  );
}

export function Spinner({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="3" opacity="0.2"/>
      <path d="M12 2a10 10 0 0110 10" stroke={color} strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}

export function ProgressBar({ value, color = 'var(--primary)', height = 6 }) {
  return (
    <div style={{
      width: '100%', height, background: 'var(--border)', borderRadius: height,
      overflow: 'hidden'
    }}>
      <div style={{
        height: '100%', width: `${Math.min(100, Math.max(0, value))}%`,
        background: color, borderRadius: height,
        transition: 'width 0.4s ease'
      }} />
    </div>
  );
}

export function Card({ children, style, className, ...props }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      ...style
    }} className={className} {...props}>
      {children}
    </div>
  );
}

export function Avatar({ name, size = 32 }) {
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const colors = ['#4f8ef7', '#a78bfa', '#34d399', '#fbbf24', '#f87171', '#38bdf8'];
  const color = colors[name?.charCodeAt(0) % colors.length] || colors[0];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, color: 'white',
      fontSize: size * 0.35, fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0
    }}>{initials}</div>
  );
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '60px 20px', gap: '12px',
      color: 'var(--text-muted)', textAlign: 'center'
    }}>
      <div style={{ fontSize: '40px', opacity: 0.5 }}>{icon || '📭'}</div>
      <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--text)' }}>{title}</div>
      {description && <div style={{ fontSize: '14px', maxWidth: '300px' }}>{description}</div>}
      {action}
    </div>
  );
}
