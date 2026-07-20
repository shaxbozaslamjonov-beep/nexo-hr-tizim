import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CandidateDashboardContent } from './CandidateDashboardContent';

export const dynamic = 'force-dynamic';

export default async function CandidateDashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.id },
    include: {
      applications: { include: { vacancy: true }, orderBy: { createdAt: 'desc' } },
      interviews: { orderBy: { scheduledAt: 'desc' } },
      trainingAssignments: { include: { module: true } },
      testResults: { include: { test: true } },
    },
  });

  return (
    <DashboardLayout
      role={session.role}
      userName={profile ? `${profile.firstName} ${profile.lastName}` : session.email}
      breadcrumbs={[{ label: 'My Application' }]}
    >
      <CandidateDashboardContent profile={profile ? JSON.parse(JSON.stringify(profile)) : null} />
    </DashboardLayout>
  );
}
