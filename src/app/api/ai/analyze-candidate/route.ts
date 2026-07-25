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

    if (!can(session, 'manage_candidates')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { candidateId } = await request.json();
    if (!candidateId) {
      return NextResponse.json({ error: 'Candidate ID is required' }, { status: 400 });
    }

    const candidate = await prisma.candidateProfile.findUnique({
      where: { id: candidateId },
      include: {
        user: { select: { email: true, phone: true } },
        applications: {
          include: { vacancy: true }
        },
        testResults: { include: { test: true } },
        interviews: true,
      }
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Nomzod topilmadi' }, { status: 404 });
    }

    const targetVacancy = candidate.applications[0]?.vacancy;

    const candidateSummary = `
F.I.Sh: ${candidate.firstName} ${candidate.lastName}
Email: ${candidate.user.email}
Tajriba: ${candidate.experience ? `${candidate.experience} oy` : 'Ko\'rsatilmagan'}
Ma'lumoti: ${candidate.education || 'Ko\'rsatilmagan'}
Kompyuter ko'nikmalari: ${candidate.computerSkill || 'Ko\'rsatilmagan'}
Manzil/Hudud: ${candidate.region || candidate.address || 'Ko\'rsatilmagan'}
Tayyorgarlik: ${candidate.shiftReady ? 'Smenali ishga tayyor' : 'Kuzatuvda'}
Topshirgan vakansiyasi: ${targetVacancy ? targetVacancy.title : 'Umumiy'}
Vakansiya talablari: ${targetVacancy?.requirements || 'Standart HR talablari'}
Test natijalari: ${candidate.testResults.map(t => `${t.test.title}: ${t.score} ball`).join(', ') || 'Test topshirmagan'}
    `.trim();

    const analysis = await askDeepSeek([
      {
        role: 'system',
        content: `
Sen Nexo HR platformasining professional AI rezyume va nomzodlar analitikasisan.
Quyida berilgan nomzod ma'lumotlari va vakansiya shartlarini tahlil qilib, quyidagi formatda O'ZBEK tilida tahliliy xulosa ber:

1. 🌟 **Kuchli tomonlari** (3-4 ta asosiy nuqta)
2. ⚠️ **Xavf/Kuchsiz tomonlari** (yoki e'tibor berish kerak bo'lgan joylar)
3. 🎯 **Vakansiyaga moslik darajasi** (0 dan 100% gacha baho va qisqa sabab)
4. 💡 **HR uchun tavsiya** (Suhbatga chaqirish kerakmi, qaysi sohaga e'tibor berish lozim)

Matnni loqayd emas, professional va chiroyli tartiblangan markdown shaklida yoz.
        `.trim(),
      },
      {
        role: 'user',
        content: `Quyidagi nomzodni tahlil qilib ber:\n\n${candidateSummary}`,
      }
    ]);

    return NextResponse.json({ analysis, candidateId });
  } catch (error: any) {
    console.error('Candidate AI Analysis Error:', error);
    return NextResponse.json({ error: error.message || 'AI tahlil qilishda xatolik' }, { status: 500 });
  }
}
