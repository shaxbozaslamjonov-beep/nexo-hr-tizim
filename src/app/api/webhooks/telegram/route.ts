import { NextResponse } from 'next/server';
import {
  sendTelegramMessage,
  getTelegramMainKeyboard,
  getWelcomeInlineKeyboard,
  getFAQInlineKeyboard,
  getAiPromptInlineKeyboard,
  setTelegramCommands,
  setTelegramWebhook,
  tryAutoLinkByUsername
} from '@/lib/telegram';
import prisma from '@/lib/prisma';
import { getDefaultCompanyId } from '@/lib/company';
import { can } from '@/lib/rbac';
import { buildHrSnapshot } from '@/lib/ai/context';
import { askDeepSeek } from '@/lib/ai/deepseek';

export const dynamic = 'force-dynamic';

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nexo-hr-tizim.vercel.app';

// Resolves which company's data to show for a chat: the linked user's
// company if this chat has been linked via Settings, otherwise the
// single default company (matches the rest of the app pre-multi-company-onboarding).
async function resolveCompanyForChat(chatId: string | number) {
  const linkedUser = await prisma.user.findUnique({
    where: { telegramChatId: String(chatId) },
    select: {
      id: true,
      companyId: true,
      role: true,
      email: true,
      telegramAiMode: true,
      employeeProfile: { select: { firstName: true, lastName: true } },
    },
  });
  if (linkedUser) return { companyId: linkedUser.companyId, user: linkedUser };
  return { companyId: await getDefaultCompanyId(), user: null };
}

const PERMISSION_DENIED_TEXT = `
🔒 <b>Ruxsat yo'q</b>

Ushbu bo'lim faqat tegishli huquqqa ega foydalanuvchilar uchun ochiq. Agar bu xato deb hisoblasangiz, tizim administratoriga murojaat qiling.
`.trim();

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
      } else if (data === 'ai_cancel') {
        const { user: linkedUser } = await resolveCompanyForChat(chatId);
        if (linkedUser) {
          await prisma.user.update({ where: { id: linkedUser.id }, data: { telegramAiMode: false } });
        }
        await sendTelegramMessage({
          chatId,
          text: '❌ AI Yordamchi bekor qilindi.',
          replyMarkup: getTelegramMainKeyboard(linkedUser?.role)
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
      const username = body.message.from?.username as string | undefined;

      // Registration-time linking: if this chat's @username matches a
      // not-yet-linked account (from the "Telegram username" field on
      // /register), connect it now and notify the user automatically.
      await tryAutoLinkByUsername(chatId, username);

      // If this chat is mid-conversation with the AI Yordamchi, treat any
      // non-slash text as the question rather than matching menu buttons.
      if (!text.startsWith('/')) {
        const { user: awaitingUser, companyId: awaitingCompanyId } = await resolveCompanyForChat(chatId);
        if (awaitingUser?.telegramAiMode) {
          await prisma.user.update({ where: { id: awaitingUser.id }, data: { telegramAiMode: false } });

          if (!can(awaitingUser, 'use_ai_assistant')) {
            await sendTelegramMessage({ chatId, text: PERMISSION_DENIED_TEXT, replyMarkup: getTelegramMainKeyboard(awaitingUser.role) });
            return NextResponse.json({ ok: true });
          }

          try {
            const snapshot = await buildHrSnapshot(awaitingCompanyId);
            const answer = await askDeepSeek([
              {
                role: 'system',
                content:
                  'Sen Nexo HR platformasining ichki AI yordamchisisan. Faqat quyida berilgan haqiqiy ma\'lumotlar asosida javob ber. ' +
                  'Agar javob berish uchun ma\'lumot yetarli bo\'lmasa, buni ochiq ayt, hech narsani o\'ylab topma. Qisqa va aniq javob ber.\n\n' +
                  `Joriy HR ma'lumotlari:\n${snapshot}`,
              },
              { role: 'user', content: text },
            ]);

            await sendTelegramMessage({
              chatId,
              text: `🤖 <b>AI Yordamchi:</b>\n\n${answer}`,
              replyMarkup: getTelegramMainKeyboard(awaitingUser.role)
            });
          } catch (err: any) {
            await sendTelegramMessage({
              chatId,
              text: `⚠️ AI Yordamchi javob bera olmadi: ${err.message || 'noma\'lum xatolik'}`,
              replyMarkup: getTelegramMainKeyboard(awaitingUser.role)
            });
          }
          return NextResponse.json({ ok: true });
        }
      }

      if (text.startsWith('/start')) {
        const { user: linkedUser } = await resolveCompanyForChat(chatId);
        const linkedName = linkedUser?.employeeProfile
          ? `${linkedUser.employeeProfile.firstName} ${linkedUser.employeeProfile.lastName}`
          : linkedUser?.email;

        await setTelegramCommands({ chatId, includeAi: can(linkedUser, 'use_ai_assistant') });

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
          replyMarkup: getTelegramMainKeyboard(linkedUser?.role)
        });

        // Also send inline web app button
        await sendTelegramMessage({
          chatId,
          text: `⚡ <b>Boshqaruv paneliga o'tish uchun quyidagi tugmani bosing:</b>`,
          replyMarkup: getWelcomeInlineKeyboard()
        });
      }
      else if (text.startsWith('/ai') || text === '🤖 AI Yordamchi') {
        const { user: linkedUser } = await resolveCompanyForChat(chatId);
        if (!can(linkedUser, 'use_ai_assistant')) {
          await sendTelegramMessage({ chatId, text: PERMISSION_DENIED_TEXT, replyMarkup: getTelegramMainKeyboard(linkedUser?.role) });
        } else {
          await prisma.user.update({ where: { id: linkedUser!.id }, data: { telegramAiMode: true } });
          await sendTelegramMessage({
            chatId,
            text: `
<b>🤖 AI Yordamchi</b>

Menga tabiiy tilda savol bering — tizimning jonli ma'lumotlari (vakansiyalar, nomzodlar, arizalar, KPI, vazifalar) asosida javob beraman.

<b>Masalan:</b>
• Bugun qancha yangi ariza tushdi?
• Qaysi vakansiyalar hali ochiq?
• 7 kundan ortiq harakatsiz qolgan arizalar bormi?
• Bajarilmagan vazifalar qaysilar?

Savolingizni shu yerga yozing 👇
            `.trim(),
            replyMarkup: getAiPromptInlineKeyboard()
          });
        }
      }
      else if (text.startsWith('/dashboard') || text === '📊 Dashboard va Hisobot') {
        const { companyId, user: linkedUser } = await resolveCompanyForChat(chatId);
        if (!can(linkedUser, 'view_hr_dashboard')) {
          await sendTelegramMessage({ chatId, text: PERMISSION_DENIED_TEXT, replyMarkup: getTelegramMainKeyboard(linkedUser?.role) });
          return NextResponse.json({ ok: true });
        }
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
          replyMarkup: getTelegramMainKeyboard(linkedUser?.role)
        });
      }
      else if (text.startsWith('/candidates') || text.startsWith('/vacancies') || text === '💼 Nomzodlar va Vakansiyalar') {
        const { companyId, user: linkedUser } = await resolveCompanyForChat(chatId);
        if (!can(linkedUser, 'manage_vacancies') && !can(linkedUser, 'manage_candidates')) {
          await sendTelegramMessage({ chatId, text: PERMISSION_DENIED_TEXT, replyMarkup: getTelegramMainKeyboard(linkedUser?.role) });
          return NextResponse.json({ ok: true });
        }
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
          replyMarkup: getTelegramMainKeyboard(linkedUser?.role)
        });
      }
      else if (text.startsWith('/employees') || text === '👥 Xodimlar Boshqaruvi') {
        const { companyId, user: linkedUser } = await resolveCompanyForChat(chatId);
        if (!can(linkedUser, 'manage_employees')) {
          await sendTelegramMessage({ chatId, text: PERMISSION_DENIED_TEXT, replyMarkup: getTelegramMainKeyboard(linkedUser?.role) });
          return NextResponse.json({ ok: true });
        }
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
          replyMarkup: getTelegramMainKeyboard(linkedUser?.role)
        });
      }
      else if (text === '📅 Davomat va KPI') {
        const { user: linkedUser } = await resolveCompanyForChat(chatId);
        if (!can(linkedUser, 'view_analytics')) {
          await sendTelegramMessage({ chatId, text: PERMISSION_DENIED_TEXT, replyMarkup: getTelegramMainKeyboard(linkedUser?.role) });
          return NextResponse.json({ ok: true });
        }
        await sendTelegramMessage({
          chatId,
          text: `
<b>📅 Davomat (Tabel) va KPI Boshqaruvi</b>

To'liq davomat va KPI jadvalini Web App orqali ko'ring:
${APP_BASE_URL}/dashboard/hr/kpi
          `.trim(),
          replyMarkup: getTelegramMainKeyboard(linkedUser?.role)
        });
      }
      else if (text === '👤 Mening Profilim') {
        const { user: linkedUser } = await resolveCompanyForChat(chatId);
        const profilePath = can(linkedUser, 'view_candidate_dashboard') ? '/dashboard/candidate' : '/dashboard/employee';
        await sendTelegramMessage({
          chatId,
          text: `
<b>👤 Mening Profilim</b>

To'liq profilingiz, KPI va vazifalaringizni Web App orqali ko'ring:
${APP_BASE_URL}${profilePath}
          `.trim(),
          replyMarkup: getTelegramMainKeyboard(linkedUser?.role)
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
        const { user: linkedUser } = await resolveCompanyForChat(chatId);
        const aiLine = can(linkedUser, 'use_ai_assistant') ? '• <code>/ai</code> — AI Yordamchi\n' : '';
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
${aiLine}• <code>/faq</code> — Savol-javoblar

📧 Administrator bilan bog'lanish: <code>admin@nexo.hr</code>
          `.trim(),
          replyMarkup: getWelcomeInlineKeyboard()
        });
      }
      else {
        // Fallback default message
        const { user: linkedUser } = await resolveCompanyForChat(chatId);
        await sendTelegramMessage({
          chatId,
          text: `
Sizning xabaringiz qabul qilindi! Quyidagi menyu tugmalaridan foydalaning yoki <code>/help</code> yuboring.
          `.trim(),
          replyMarkup: getTelegramMainKeyboard(linkedUser?.role)
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
