import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PathDetailContent } from './PathDetailContent';

export default async function PathDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect('/login');
  
  return <PathDetailContent id={params.id} />;
}
