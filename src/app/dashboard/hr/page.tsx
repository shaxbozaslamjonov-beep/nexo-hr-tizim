import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { HRDashboardContent } from './HRDashboardContent';

export default async function HRDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (!['HR_MANAGER', 'ADMIN', 'DIRECTOR', 'DEPARTMENT_HEAD'].includes(session.role)) {
    redirect('/dashboard/employee');
  }

  return <HRDashboardContent />;
}
