import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { can } from '@/lib/rbac';
import { askDeepSeek } from '@/lib/ai/deepseek';
import { buildHrSnapshot } from '@/lib/ai/context';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!can(session, 'use_ai_assistant')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { question, history } = await request.json();
    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Missing question' }, { status: 400 });
    }

    const snapshot = await buildHrSnapshot(session.companyId);

    const messages = [
      {
        role: 'system' as const,
        content:
          'Sen Nexo HR platformasining ichki AI yordamchisisan. Faqat quyida berilgan haqiqiy ma\'lumotlar asosida javob ber. ' +
          'Agar javob berish uchun ma\'lumot yetarli bo\'lmasa, buni ochiq ayt, hech narsani o\'ylab topma. Qisqa va aniq javob ber.\n\n' +
          `Joriy HR ma'lumotlari:\n${snapshot}`,
      },
      ...(Array.isArray(history) ? history.slice(-6) : []),
      { role: 'user' as const, content: question },
    ];

    const answer = await askDeepSeek(messages);
    return NextResponse.json({ answer });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'AI assistant failed' }, { status: 500 });
  }
}
