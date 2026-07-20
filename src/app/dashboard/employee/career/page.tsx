import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import prisma from '@/lib/prisma';

export default async function EmployeeCareerPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const profile = await prisma.employeeProfile.findUnique({
    where: { userId: session.id },
  });

  const levels = await prisma.careerLevel.findMany({
    where: { role: profile?.position || undefined },
  });

  return (
    <DashboardLayout
      role={session.role}
      userName={session.email}
      breadcrumbs={[
        { label: 'My Dashboard', href: '/dashboard/employee' },
        { label: 'Career Path' },
      ]}
    >
      <div style={{ padding: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>My Career Progression</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Trace your journey from Junior to Expert levels.</p>

        <div style={{ position: 'relative', paddingLeft: '2rem' }}>
          <div style={{ position: 'absolute', left: '7px', top: '0', bottom: '0', width: '2px', background: 'var(--border)' }} />
          
          {levels.map((level, i) => (
            <div key={level.id} style={{ marginBottom: '2rem', position: 'relative' }}>
              <div style={{ 
                position: 'absolute', 
                left: '-2rem', 
                top: '4px',
                width: '16px', 
                height: '16px', 
                borderRadius: '50%', 
                background: level.levelName === profile?.position ? 'var(--primary)' : 'white',
                border: `3px solid ${level.levelName === profile?.position ? 'var(--primary)' : 'var(--border)'}`,
                zIndex: 1
              }} />
              <div style={{
                background: level.levelName === profile?.position ? 'rgba(59, 130, 246, 0.05)' : 'white',
                border: `1px solid ${level.levelName === profile?.position ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                boxShadow: level.levelName === profile?.position ? '0 0 0 1px var(--primary)' : 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontWeight: 700, color: 'var(--foreground)' }}>{level.levelName}</h3>
                  {level.levelName === profile?.position && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', background: 'rgba(59, 130, 246, 0.1)', padding: '0.125rem 0.5rem', borderRadius: '4px' }}>Current Level</span>
                  )}
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{level.requirements}</p>
              </div>
            </div>
          ))}
          {!levels.length && (
            <div style={{ color: '#94a3b8' }}>Career path information not defined for your role.</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
