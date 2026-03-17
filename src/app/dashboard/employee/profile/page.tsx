import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import prisma from '@/lib/prisma';

export default async function EmployeeProfilePage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const profile = await prisma.employeeProfile.findUnique({
    where: { userId: session.id },
  });

  return (
    <DashboardLayout
      role={session.role}
      userName={session.email}
      breadcrumbs={[
        { label: 'My Dashboard', href: '/dashboard/employee' },
        { label: 'Profile' },
      ]}
    >
      <div style={{ padding: '1rem', maxWidth: '800px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>Information Portal</h1>
        
        <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ height: '120px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }} />
          <div style={{ padding: '2rem', position: 'relative' }}>
            <div style={{ 
              position: 'absolute', 
              top: '-48px', 
              left: '2rem', 
              width: '96px', 
              height: '96px', 
              borderRadius: '24px', 
              background: '#f1f5f9', 
              border: '4px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              boxShadow: 'var(--shadow-md)'
            }}>
              👤
            </div>
            <div style={{ marginLeft: '112px', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{profile?.firstName} {profile?.lastName}</h2>
              <p style={{ color: '#64748b' }}>{profile?.position} • {profile?.department}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              {[
                ['Email Address', session.email],
                ['Phone Number', '+998 90 123 45 67'], // placeholder as not in schema for employee
                ['Hire Date', profile?.hireDate ? new Date(profile.hireDate).toLocaleDateString() : '—'],
                ['Employment Status', profile?.status || 'Active'],
                ['Employee ID', session.id.slice(0, 8).toUpperCase()],
                ['Salary Plan', 'Standard Performance'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 500, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '0.25rem' }}>{label}</p>
                  <p style={{ fontWeight: 600, color: 'var(--foreground)' }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
