import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { can } from '@/lib/rbac';
import { askDeepSeek } from '@/lib/ai/deepseek';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!can(session, 'manage_vacancies')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { title, department, shift } = await request.json();
    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Missing title' }, { status: 400 });
    }

    const prompt =
      `Lavozim nomi: "${title}"${department ? `, bo'lim: "${department}"` : ''}${shift ? `, smena: "${shift}"` : ''}.\n` +
      'Bu ishlab chiqarish (manufacturing) korxonasi uchun vakansiya. Quyidagi JSON formatida javob ber, ' +
      'boshqa hech qanday matn qo\'shma, faqat toza JSON:\n' +
      '{"description": "lavozim tavsifi, 3-4 gap, mas\'uliyatlar haqida", "requirements": "talablar ro\'yxati, har biri yangi qatorda, \'- \' bilan boshlanadi"}';

    const raw = await askDeepSeek(
      [
        { role: 'system', content: 'Sen HR uchun vakansiya matnlarini yozib beruvchi yordamchisan. Faqat so\'ralgan JSON formatida javob ber.' },
        { role: 'user', content: prompt },
      ],
      0.6
    );

    let parsed: { description?: string; requirements?: string };
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    } catch {
      return NextResponse.json({ error: 'AI response could not be parsed' }, { status: 502 });
    }

    return NextResponse.json({
      description: parsed.description || '',
      requirements: parsed.requirements || '',
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to generate vacancy text' }, { status: 500 });
  }
}
