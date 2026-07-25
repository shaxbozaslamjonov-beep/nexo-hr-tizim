import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { can } from '@/lib/rbac';
import { askDeepSeek } from '@/lib/ai/deepseek';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!can(session, 'manage_vacancies')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { vacancyId, positionTitle } = await request.json();

    let title = positionTitle || '';
    let requirements = '';
    let department = '';

    if (vacancyId) {
      const vacancy = await prisma.vacancy.findUnique({
        where: { id: vacancyId },
      });
      if (vacancy) {
        title = vacancy.title;
        requirements = vacancy.requirements || '';
        department = vacancy.department;
      }
    }

    if (!title) {
      return NextResponse.json({ error: 'Lavozim yoki Vakansiya ID majburiy' }, { status: 400 });
    }

    const questions = await askDeepSeek([
      {
        role: 'system',
        content: `
Sen Nexo HR platformasining tajribali HR Assistentisan.
Berilgan lavozim va talablar bo'yicha HR menejer suhbatda berishi uchun eng muhim va aniqlik kirituvchi suhbat savollarini O'ZBEK tilida tayyorlab ber.

Format:
📌 **1. Texnik va Amaliy Savollar (Hard Skills)**: 4 ta savol
📌 **2. Xulq-atvor va Kompetensiya Savollari (Soft Skills / STAR usuli)**: 3 ta savol
📌 **3. Motivatsiya va Jamoaga Moslik Savollari**: 3 ta savol

Har bir savol ostida HR uchun nomzodning javobida nimaga e'tibor berish kerakligi bo'yicha qisqa ko'rsatma (💡 *Bunda nimaga e'tibor beriladi*) bo'lsin.
        `.trim(),
      },
      {
        role: 'user',
        content: `Lavozim: ${title}\nBo'lim: ${department || 'General'}\nTalablar: ${requirements || 'Standart HR talablari'}`,
      }
    ]);

    return NextResponse.json({ questions, title });
  } catch (error: any) {
    console.error('Generate Questions AI Error:', error);
    return NextResponse.json({ error: error.message || 'Savollarni generatsiya qilishda xatolik' }, { status: 500 });
  }
}
