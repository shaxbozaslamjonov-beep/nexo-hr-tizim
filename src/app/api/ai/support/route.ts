import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { askDeepSeek } from '@/lib/ai/deepseek';
import { buildCandidateSelfContext, buildEmployeeSelfContext } from '@/lib/ai/context';

export const dynamic = 'force-dynamic';

// Self-scoped support chat for CANDIDATE and EMPLOYEE roles. Each user can only ever
// see their own data — the context builders never accept another user's id.
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { question, history } = await request.json();
    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Missing question' }, { status: 400 });
    }

    let context: string;
    if (session.role === 'CANDIDATE') {
      context = await buildCandidateSelfContext(session.id);
    } else if (session.role === 'EMPLOYEE') {
      context = await buildEmployeeSelfContext(session.id);
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const messages = [
      {
        role: 'system' as const,
        content:
          'Sen Nexo HR platformasining foydalanuvchi yordamchisisan. Faqat quyida berilgan, ' +
          'shu foydalanuvchining OʻZ ma\'lumotlari asosida javob ber. Boshqa hech kimning ma\'lumotini bilmaysan ' +
          'va hech qachon o\'ylab topma. Agar javob berish uchun ma\'lumot yetarli bo\'lmasa, buni ochiq ayt. ' +
          'Qisqa, do\'stona va aniq javob ber.\n\n' +
          `Foydalanuvchining shaxsiy ma'lumotlari:\n${context}`,
      },
      ...(Array.isArray(history) ? history.slice(-6) : []),
      { role: 'user' as const, content: question },
    ];

    const answer = await askDeepSeek(messages);
    return NextResponse.json({ answer });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Support assistant failed' }, { status: 500 });
  }
}
