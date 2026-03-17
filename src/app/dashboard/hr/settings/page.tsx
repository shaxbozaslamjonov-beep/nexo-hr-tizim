import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { SettingsContent } from './SettingsContent';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default async function SettingsPage() {
  const session = await getSession();
  
  if (!session) redirect('/login');
  
  if (!['HR_MANAGER', 'ADMIN', 'DIRECTOR', 'DEPARTMENT_HEAD'].includes(session.role)) {
    redirect('/dashboard/employee');
  }

  return <SettingsContent />;
}
