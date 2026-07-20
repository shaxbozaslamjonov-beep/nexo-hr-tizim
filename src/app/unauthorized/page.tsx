export default function UnauthorizedPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--background)',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚫</div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Access Denied</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>You do not have permission to view this page.</p>
      <a href="/login" style={{
        padding: '0.625rem 1.5rem',
        background: '#3b82f6',
        color: 'white',
        borderRadius: '0.5rem',
        fontWeight: 600,
        textDecoration: 'none',
      }}>
        Go to Login
      </a>
    </div>
  );
}
