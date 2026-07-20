import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { can } from '@/lib/rbac';
import { AiAssistantContent } from './AiAssistantContent';

export default async function AiAssistantPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (!can(session, 'use_ai_assistant')) redirect('/dashboard/hr');

  return <AiAssistantContent />;
}
