import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ChangePasswordForm } from './ChangePasswordForm';

export const dynamic = 'force-dynamic';

export default async function CandidateProfilePage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const profile = await prisma.candidateProfile.findUnique({ where: { userId: session.id } });

  const fields: [string, string | number | null | undefined][] = [
    ['Ism', profile?.firstName],
    ['Familiya', profile?.lastName],
    ['Email', session.email],
    ['Telefon', profile?.phone],
    ['Manzil', profile?.address],
    ["Ta'lim", profile?.education],
    ['Tajriba (oy)', profile?.experience],
  ];

  return (
    <DashboardLayout role={session.role} userName={profile ? `${profile.firstName} ${profile.lastName}` : session.email} breadcrumbs={[{ label: 'My Profile' }]}>
      <div style={{ padding: '1rem', maxWidth: '600px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Profil</h1>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
          {fields.map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
              <span style={{ fontWeight: 600 }}>{value ?? '—'}</span>
            </div>
          ))}
        </div>
        <ChangePasswordForm />
      </div>
    </DashboardLayout>
  );
}
