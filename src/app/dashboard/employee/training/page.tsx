import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import prisma from '@/lib/prisma';

export default async function EmployeeTrainingPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const assignments = await prisma.trainingAssignment.findMany({
    where: { employee: { userId: session.id } },
    include: { module: { include: { track: true } } },
  });

  return (
    <DashboardLayout
      role={session.role}
      userName={session.email}
      breadcrumbs={[
        { label: 'My Dashboard', href: '/dashboard/employee' },
        { label: 'Training' },
      ]}
    >
      <div style={{ padding: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>My Training Portfolio</h1>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Complete your assigned modules to advance your career.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {assignments.map((a) => (
            <div key={a.id} style={{
              background: 'white',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.5rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                  {a.module.type === 'VIDEO' ? '🎬' : a.module.type === 'QUIZ' ? '📝' : '📄'}
                </div>
                <div>
                  <h3 style={{ fontWeight: 600, color: 'var(--foreground)' }}>{a.module.title}</h3>
                  <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>{a.module.track.title}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ 
                  padding: '0.25rem 0.625rem', 
                  borderRadius: '9999px', 
                  fontSize: '0.75rem', 
                  fontWeight: 600,
                  background: a.status === 'COMPLETED' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                  color: a.status === 'COMPLETED' ? 'var(--success)' : 'var(--warning)'
                }}>
                  {a.status}
                </span>
                <button style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: a.status === 'COMPLETED' ? 'var(--secondary)' : 'var(--primary)',
                  color: a.status === 'COMPLETED' ? 'var(--foreground)' : 'white',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}>
                  {a.status === 'COMPLETED' ? 'Review' : 'Start Now'}
                </button>
              </div>
            </div>
          ))}
          {!assignments.length && (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
              No training modules assigned yet.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
