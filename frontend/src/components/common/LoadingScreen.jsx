import { Spinner } from './UI';

export default function LoadingScreen() {
  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexDirection: 'column', gap: '16px',
      background: 'var(--bg)', zIndex: 9999
    }}>
      <div style={{
        width: 44, height: 44, background: 'var(--primary)', borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Spinner size={22} color="white" />
      </div>
      <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading ProjectFlow…</span>
    </div>
  );
}
