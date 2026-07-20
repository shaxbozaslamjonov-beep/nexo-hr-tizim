import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import prisma from '@/lib/prisma';

export default async function EmployeeKPIPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const profile = await prisma.employeeProfile.findUnique({
    where: { userId: session.id },
    include: { kpis: { include: { kpi: true } } },
  });

  return (
    <DashboardLayout
      role={session.role}
      userName={session.email}
      breadcrumbs={[
        { label: 'My Dashboard', href: '/dashboard/employee' },
        { label: 'My KPI' },
      ]}
    >
      <div style={{ padding: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>My Performance (KPI)</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {profile?.kpis.map((entry) => (
            <div key={entry.id} style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{entry.kpi.name}</span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Target: {entry.kpi.targetValue}{entry.kpi.unit}</span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: entry.value >= entry.kpi.targetValue ? 'var(--success)' : 'var(--danger)', marginBottom: '0.5rem' }}>
                {entry.value}{entry.kpi.unit}
              </div>
              <div style={{ height: '8px', background: 'var(--bg-muted)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${Math.min((entry.value / entry.kpi.targetValue) * 100, 100)}%`, 
                  background: entry.value >= entry.kpi.targetValue ? 'var(--success)' : 'var(--warning)'
                }} />
              </div>
              <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                Period: {new Date(entry.periodDate).toLocaleDateString()}
              </div>
            </div>
          ))}
          {!profile?.kpis.length && (
            <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '4rem', color: '#94a3b8' }}>
              No KPI data available yet.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
