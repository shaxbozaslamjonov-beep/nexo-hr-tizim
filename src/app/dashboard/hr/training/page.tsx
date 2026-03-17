import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { TrainingTracksContent } from './TrainingTracksContent';

export default async function TrainingTracksPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  
  if (!['HR_MANAGER', 'ADMIN', 'DIRECTOR', 'DEPARTMENT_HEAD', 'EMPLOYEE'].includes(session.role)) {
    redirect('/dashboard');
  }

  return <TrainingTracksContent />;
}
