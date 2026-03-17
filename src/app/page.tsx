import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function RootPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  // Route by role
  if (['HR_MANAGER', 'ADMIN', 'DIRECTOR', 'DEPARTMENT_HEAD'].includes(session.role)) {
    redirect('/dashboard/hr');
  }
  if (session.role === 'CANDIDATE') {
    redirect('/dashboard/candidate');
  }
  redirect('/dashboard/employee');
}
