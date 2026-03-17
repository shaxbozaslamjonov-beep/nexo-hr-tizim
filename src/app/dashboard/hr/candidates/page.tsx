import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { CandidatesContent } from './CandidatesContent';

export default async function CandidatesPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  
  if (!['HR_MANAGER', 'ADMIN', 'DIRECTOR', 'DEPARTMENT_HEAD'].includes(session.role)) {
    redirect('/dashboard/employee');
  }

  return <CandidatesContent />;
}
