import { NextResponse } from 'next/server';
import { 
  sendTelegramMessage, 
  getTelegramMainKeyboard, 
  getWelcomeInlineKeyboard, 
  getFAQInlineKeyboard,
  setTelegramCommands,
  setTelegramWebhook
} from '@/lib/telegram';

export const dynamic = 'force-dynamic';

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nexo-hr-tizim.vercel.app';

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
        const replyText = `
<b>Assalomu alaykum, ${firstName}! 👋</b>

🚀 <b>Nexo HR Platformasi Rasmiy Telegram Botiga xush kelibsiz!</b>

Ushbu bot orqali siz:
• Jonli HR analitika va hisobotlarni ko'rishingiz
• Vakansiyalar va yangi nomzodlar xabarnomalarini olishingiz
• Davomat, KPI va xodimlar ma'lumotlarini kuzatishingiz mumkin.

🆔 Sizning Telegram Chat ID: <code>${chatId}</code>
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
        await sendTelegramMessage({
          chatId,
          text: `
<b>📊 Nexo HR Dashboard & Analitika</b>

• <b>Jami Nomzodlar:</b> 3 ta
• <b>Faol Vakansiyalar:</b> 3 ta
• <b>KPI Qamrovi:</b> 100%
• <b>O'rtacha Vaqt:</b> 4 kun

🌐 To'liq jonli grafiklarni ko'rish uchun Web App ga o'ting:
${APP_BASE_URL}/dashboard/hr
          `.trim(),
          replyMarkup: getTelegramMainKeyboard()
        });
      }
      else if (text.startsWith('/candidates') || text.startsWith('/vacancies') || text === '💼 Nomzodlar va Vakansiyalar') {
        await sendTelegramMessage({
          chatId,
          text: `
<b>💼 Vakansiyalar va Nomzodlar Boshqaruvi</b>

• <b>Senior Fullstack Developer:</b> 2 otklik
• <b>HR Manager:</b> 1 otklik
• <b>Product Designer:</b> 0 otklik

📋 Nomzodlar rezyumelarini ko'rish va suhbat belgilash:
${APP_BASE_URL}/dashboard/hr/candidates
          `.trim(),
          replyMarkup: getTelegramMainKeyboard()
        });
      }
      else if (text.startsWith('/employees') || text === '👥 Xodimlar Boshqaruvi') {
        await sendTelegramMessage({
          chatId,
          text: `
<b>👥 Xodimlar va Bo'limlar</b>

• Adminlar: 1 ta
• HR Menejerlar: 1 ta
• Xodimlar: 4 ta
• Sinov muddatidagi xodimlar: 0 ta

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

• Bugungi keldi-ketdi: 100% faol
• Bajarilgan KPI vazifalari: 85%

📊 Davomat jadvalini ochish:
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
