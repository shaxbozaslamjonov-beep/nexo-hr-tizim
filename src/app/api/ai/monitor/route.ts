import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { can } from '@/lib/rbac';
import { askDeepSeek } from '@/lib/ai/deepseek';
import { buildHrSnapshot } from '@/lib/ai/context';

export const dynamic = 'force-dynamic';

// On-demand anomaly / policy-compliance check over the current HR pipeline.
export async function POST() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!can(session, 'use_ai_assistant')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const snapshot = await buildHrSnapshot();

    const messages = [
      {
        role: 'system' as const,
        content:
          'Sen Nexo HR platformasi uchun jarayon nazorati AI agentisan. Quyida berilgan haqiqiy HR pipeline ' +
          'ma\'lumotlarini tahlil qil va faqat aniq muammolarni top: masalan uzoq vaqt harakatsiz qolgan arizalar, ' +
          'g\'ayrioddiy ko\'p rad etish, muddati o\'tgan bosqichlar, e\'lonlarning tasdiqlash jarayoniga muvofiqligi. ' +
          'Har bir topilma uchun aniq kim/nima va nima qilish kerakligini yoz. Agar muammo topilmasa, aniq shuni ayt ' +
          '("hech qanday muammo topilmadi"), o\'ylab topma. Ro\'yxat ko\'rinishida, qisqa yoz.',
      },
      { role: 'user' as const, content: `Tahlil qil:\n\n${snapshot}` },
    ];

    const report = await askDeepSeek(messages, 0.2);
    return NextResponse.json({ report, generatedAt: new Date().toISOString() });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'AI monitor failed' }, { status: 500 });
  }
}
