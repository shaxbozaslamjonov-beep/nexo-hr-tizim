import { NextResponse } from 'next/server';
import {
  sendTelegramMessage,
  getTelegramMainKeyboard,
  getWelcomeInlineKeyboard,
  getFAQInlineKeyboard,
  setTelegramCommands,
  setTelegramWebhook
} from '@/lib/telegram';
import prisma from '@/lib/prisma';
import { getDefaultCompanyId } from '@/lib/company';

export const dynamic = 'force-dynamic';

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nexo-hr-tizim.vercel.app';

// Resolves which company's data to show for a chat: the linked user's
// company if this chat has been linked via Settings, otherwise the
// single default company (matches the rest of the app pre-multi-company-onboarding).
async function resolveCompanyForChat(chatId: string | number) {
  const linkedUser = await prisma.user.findUnique({
    where: { telegramChatId: String(chatId) },
    select: { companyId: true, role: true, email: true, employeeProfile: { select: { firstName: true, lastName: true } } },
  });
  if (linkedUser) return { companyId: linkedUser.companyId, user: linkedUser };
  return { companyId: await getDefaultCompanyId(), user: null };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('[Telegram Webhook Received]', JSON.stringify(body));

    // 1. Handle Callback Queries (Inline button clicks)
    if (body.callback_query) {
      const callback = body.callback_query;
      const chatId = callback.message.chat.id;
      const data = callback.data;

      if (data === 'faq_main' || data === 'faq') {
        await sendTelegramMessage({
          chatId,
          text: `
<b>❓ Ko'p Beriladigan Savollar (FAQ)</b>

Quyidagi tugmalardan birini tanlab, to'liq javobni olishingiz mumkin:
          `.trim(),
          replyMarkup: getFAQInlineKeyboard()
        });
      } else if (data === 'faq_1') {
        await sendTelegramMessage({
          chatId,
          text: `
<b>1. Nexo HR platformasi nima?</b>

Nexo HR — korxonalar uchun moslashtirilgan sun'iy intellekt (AI) bilan jihozlangan kadrlar boshqaruvi platformasi bo'lib, quyidagi modullarni o'z ichiga oladi:
• Vakansiya va Nomzodlar voronkasi (Recruitment)
• Xodimlar va Davomat boshqaruvi
• KPI va Karyera xaritalari
• AI Vakansiya generatsiyasi va Telegram xabarnomalar.
          `.trim(),
          replyMarkup: getFAQInlineKeyboard()
        });
      } else if (data === 'faq_2') {
        await sendTelegramMessage({
          chatId,
          text: `
<b>2. Yangi nomzod va vakansiya yaratish tartibi qanday?</b>

Vakansiya yaratish uchun HR Paneldan <b>Vakansiyalar</b> bo'limiga o'ting va <i>"+ Yangi Vakansiya"</i> tugmasini bosing yoki AI Assistent yordamida avtomatik ta'rif yarating.
Nomzodlar esa ommaviy <code>/apply</code> sahifasi yoki Google Forms orqali avtomatik kelib tushadi.
          `.trim(),
          replyMarkup: getFAQInlineKeyboard()
        });
      } else if (data === 'faq_3') {
        await sendTelegramMessage({
          chatId,
          text: `
<b>3. Telegram xabarnomalarini qanday yoqish mumkin?</b>

1) Botimizga <code>/start</code> yuboring va Telegram ID ingizni oling.
2) Nexo HR platformasidagi <b>Sozlamalar -> Profil</b> bo'limiga o'ting.
3) Telegram ID ingizni kiritib saqlang. Endi barcha muhim xabarlar botga keladi!
          `.trim(),
          replyMarkup: getFAQInlineKeyboard()
        });
      } else if (data === 'faq_4') {
        await sendTelegramMessage({
          chatId,
          text: `
<b>4. RBAC ruxsatnomalari va xavfsizlik</b>

Tizimda 5 xil rol mavjud: <b>ADMIN, HR MANAGER, DIRECTOR, DEPARTMENT HEAD, EMPLOYEE</b>.
Har bir roldagi foydalanuvchi faqat o'ziga ruxsat berilgan modullarga kira oladi. Barcha o'zgarishlar Audit logda saqlanadi.
          `.trim(),
          replyMarkup: getFAQInlineKeyboard()
        });
      } else if (data === 'faq_5') {
        await sendTelegramMessage({
          chatId,
          text: `
<b>5. Parolni tiklash va kirish muammolari</b>

Agar parolingizni unutgan bo'lsangiz, login sahifasidagi <i>"Parolni unutdingizmi?"</i> havolasini bosing yoki Admin-ga murojaat qilib parolingizni tiklatishingiz mumkin.
          `.trim(),
          replyMarkup: getFAQInlineKeyboard()
        });
      } else if (data === 'support_contact') {
        await sendTelegramMessage({
          chatId,
          text: `
<b>📞 Texnik Qo'llab-quvvatlash</b>

Savollaringiz yoki takliflaringiz bo'lsa:
📧 Email: <code>support@nexo.hr</code>
🌐 Vercel Web Panel: ${APP_BASE_URL}
          `.trim(),
          replyMarkup: getWelcomeInlineKeyboard()
        });
      }
      return NextResponse.json({ ok: true });
    }

    // 2. Handle Text Messages & Commands
    if (body.message) {
      const chatId = body.message.chat.id;
      const text = (body.message.text || '').trim();
      const firstName = body.message.from?.first_name || 'Foydalanuvchi';

      if (text.startsWith('/start')) {
        const { user: linkedUser } = await resolveCompanyForChat(chatId);
        const linkedName = linkedUser?.employeeProfile
          ? `${linkedUser.employeeProfile.firstName} ${linkedUser.employeeProfile.lastName}`
          : linkedUser?.email;

        const replyText = linkedUser
          ? `
<b>Assalomu alaykum, ${linkedName}! 👋</b>

✅ Akkauntingiz ulangan (<b>${linkedUser.role}</b>). Endi yangi arizalar va boshqa muhim yangiliklar shu chatga keladi.

🚀 <b>Nexo HR Platformasi Rasmiy Telegram Botiga xush kelibsiz!</b>
          `.trim()
          : `
<b>Assalomu alaykum, ${firstName}! 👋</b>

🚀 <b>Nexo HR Platformasi Rasmiy Telegram Botiga xush kelibsiz!</b>

Ushbu bot orqali siz:
• Jonli HR analitika va hisobotlarni ko'rishingiz
• Vakansiyalar va yangi nomzodlar xabarnomalarini olishingiz
• Davomat, KPI va xodimlar ma'lumotlarini kuzatishingiz mumkin.

🆔 Sizning Telegram Chat ID: <code>${chatId}</code>

🔗 <b>Akkauntingizni ulash uchun:</b> Nexo HR'da <b>Sozlamalar → Profil → Telegram</b> bo'limiga o'ting va yuqoridagi Chat ID'ni kiriting.
        `.trim();

        await sendTelegramMessage({
          chatId,
          text: replyText,
          replyMarkup: getTelegramMainKeyboard()
        });

        // Also send inline web app button
        await sendTelegramMessage({
          chatId,
          text: `⚡ <b>Boshqaruv paneliga o'tish uchun quyidagi tugmani bosing:</b>`,
          replyMarkup: getWelcomeInlineKeyboard()
        });
      }
      else if (text.startsWith('/dashboard') || text === '📊 Dashboard va Hisobot') {
        const { companyId } = await resolveCompanyForChat(chatId);
        const [candidatesCount, openVacancies, closedVacancies, totalVacancies] = await Promise.all([
          prisma.candidateProfile.count({ where: { user: { companyId } } }),
          prisma.vacancy.count({ where: { companyId, status: 'OPEN' } }),
          prisma.vacancy.count({ where: { companyId, status: 'CLOSED' } }),
          prisma.vacancy.count({ where: { companyId } }),
        ]);

        await sendTelegramMessage({
          chatId,
          text: `
<b>📊 Nexo HR Dashboard & Analitika</b>

• <b>Jami Nomzodlar:</b> ${candidatesCount} ta
• <b>Ochiq Vakansiyalar:</b> ${openVacancies} ta
• <b>Yopilgan Vakansiyalar:</b> ${closedVacancies}/${totalVacancies}

🌐 To'liq jonli grafiklarni ko'rish uchun Web App ga o'ting:
${APP_BASE_URL}/dashboard/hr/analytics
          `.trim(),
          replyMarkup: getTelegramMainKeyboard()
        });
      }
      else if (text.startsWith('/candidates') || text.startsWith('/vacancies') || text === '💼 Nomzodlar va Vakansiyalar') {
        const { companyId } = await resolveCompanyForChat(chatId);
        const vacancies = await prisma.vacancy.findMany({
          where: { companyId, status: 'OPEN' },
          select: { title: true, _count: { select: { applications: true } } },
          orderBy: { createdAt: 'desc' },
          take: 5,
        });

        const list = vacancies.length > 0
          ? vacancies.map((v) => `• <b>${v.title}:</b> ${v._count.applications} ta ariza`).join('\n')
          : 'Hozircha ochiq vakansiyalar yo\'q.';

        await sendTelegramMessage({
          chatId,
          text: `
<b>💼 Vakansiyalar va Nomzodlar Boshqaruvi</b>

${list}

📋 Nomzodlar rezyumelarini ko'rish va suhbat belgilash:
${APP_BASE_URL}/dashboard/hr/candidates
          `.trim(),
          replyMarkup: getTelegramMainKeyboard()
        });
      }
      else if (text.startsWith('/employees') || text === '👥 Xodimlar Boshqaruvi') {
        const { companyId } = await resolveCompanyForChat(chatId);
        const [admins, hrManagers, employees, onboarding] = await Promise.all([
          prisma.user.count({ where: { companyId, role: 'ADMIN' } }),
          prisma.user.count({ where: { companyId, role: 'HR_MANAGER' } }),
          prisma.user.count({ where: { companyId, role: 'EMPLOYEE' } }),
          prisma.employeeProfile.count({ where: { user: { companyId }, status: 'ONBOARDING' } }),
        ]);

        await sendTelegramMessage({
          chatId,
          text: `
<b>👥 Xodimlar va Bo'limlar</b>

• Adminlar: ${admins} ta
• HR Menejerlar: ${hrManagers} ta
• Xodimlar: ${employees} ta
• Onboarding jarayonida: ${onboarding} ta

👥 Xodimlar ro'yxati va rollarni sozlash:
${APP_BASE_URL}/dashboard/hr/employees
          `.trim(),
          replyMarkup: getTelegramMainKeyboard()
        });
      }
      else if (text === '📅 Davomat va KPI') {
        await sendTelegramMessage({
          chatId,
          text: `
<b>📅 Davomat (Tabel) va KPI Boshqaruvi</b>

To'liq davomat va KPI jadvalini Web App orqali ko'ring:
${APP_BASE_URL}/dashboard/hr/kpi
          `.trim(),
          replyMarkup: getTelegramMainKeyboard()
        });
      }
      else if (text.startsWith('/faq') || text === '❓ FAQ / Savol-Javoblar') {
        await sendTelegramMessage({
          chatId,
          text: `
<b>❓ Ko'p Beriladigan Savollar (FAQ)</b>

Iltimos, o'zingizni qiziqtirgan savol tugmasini bosing:
          `.trim(),
          replyMarkup: getFAQInlineKeyboard()
        });
      }
      else if (text.startsWith('/help')) {
        await sendTelegramMessage({
          chatId,
          text: `
<b>ℹ️ Yordam va Qo'llab-quvvatlash Markazi</b>

Yordam uchun buyruqlar ro'yxati:
• <code>/start</code> — Bosh menyuni ochish
• <code>/dashboard</code> — Hisobotlar
• <code>/candidates</code> — Nomzodlar
• <code>/vacancies</code> — Vakansiyalar
• <code>/employees</code> — Xodimlar
• <code>/faq</code> — Savol-javoblar

📧 Administrator bilan bog'lanish: <code>admin@nexo.hr</code>
          `.trim(),
          replyMarkup: getWelcomeInlineKeyboard()
        });
      }
      else {
        // Fallback default message
        await sendTelegramMessage({
          chatId,
          text: `
Sizning xabaringiz qabul qilindi! Quyidagi menyu tugmalaridan foydalaning yoki <code>/help</code> yuboring.
          `.trim(),
          replyMarkup: getTelegramMainKeyboard()
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[Telegram Webhook Error]', error);
    return NextResponse.json({ error: error.message || 'Webhook error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const setup = searchParams.get('setup');
  const host = request.headers.get('host') || 'nexo-hr-tizim.vercel.app';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const webhookUrl = `${protocol}://${host}/api/webhooks/telegram`;

  if (setup === 'true') {
    const result = await setTelegramWebhook(webhookUrl);
    const commandsResult = await setTelegramCommands();
    return NextResponse.json({
      success: result.ok,
      webhookUrl,
      webhookResult: result,
      commandsResult
    });
  }

  return NextResponse.json({
    status: 'online',
    botTokenConfigured: true,
    webhookEndpoint: '/api/webhooks/telegram',
    configuredUrl: webhookUrl,
  });
}
