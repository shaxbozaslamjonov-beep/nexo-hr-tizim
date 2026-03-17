import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default async function EmployeeDashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <DashboardLayout
      role={session.role}
      userName={session.email}
      breadcrumbs={[{ label: 'My Dashboard' }]}
    >
      <div style={{ padding: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Welcome back! 👋</h1>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Here is your personal workspace.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {[
            { icon: '🏆', title: 'My KPI', desc: 'Track your performance indicators', href: '/dashboard/employee/kpi' },
            { icon: '🎓', title: 'Training', desc: 'Continue your learning modules', href: '/dashboard/employee/training' },
            { icon: '🛤️', title: 'Career Path', desc: 'See your next promotion level', href: '/dashboard/employee/career' },
            { icon: '👤', title: 'My Profile', desc: 'View and update your details', href: '/dashboard/employee/profile' },
          ].map((item) => (
            <a key={item.title} href={item.href}
              style={{
                background: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s, transform 0.2s',
                textDecoration: 'none',
                color: 'inherit',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = ''; (e.currentTarget as HTMLElement).style.transform = ''; }}
            >
              <span style={{ fontSize: '2rem' }}>{item.icon}</span>
              <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{item.title}</span>
              <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>{item.desc}</span>
            </a>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
