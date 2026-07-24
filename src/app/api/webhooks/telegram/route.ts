import { NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('[Telegram Webhook Received]', JSON.stringify(body));

    // Handle Telegram Update message
    if (body.message) {
      const chatId = body.message.chat.id;
      const text = body.message.text || '';
      const username = body.message.from?.username || '';
      const firstName = body.message.from?.first_name || '';

      if (text.startsWith('/start')) {
        const replyText = `
<b>Assalomu alaykum, ${firstName}! 👋</b>

Nexo HR Botiga xush kelibsiz!
Sizning Telegram ma'lumotlaringiz:
🆔 <b>Telegram ID:</b> <code>${chatId}</code>
👤 <b>Username:</b> ${username ? `@${username}` : 'Mavjud emas'}

Ushbu Telegram ID (<code>${chatId}</code>) ni Nexo HR tizimidagi profilingizga kiritib, xabarnomalarni Telegram orqali qabul qilishingiz mumkin!
        `.trim();

        await sendTelegramMessage({
          chatId,
          text: replyText,
        });
      } else if (text.startsWith('/myid')) {
        await sendTelegramMessage({
          chatId,
          text: `Sizning Telegram ID: <code>${chatId}</code>`,
        });
      } else {
        await sendTelegramMessage({
          chatId,
          text: `Rahmat! Sizning xabaringiz qabul qilindi. Telegram ID ingiz: <code>${chatId}</code>`,
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[Telegram Webhook Error]', error);
    return NextResponse.json({ error: error.message || 'Webhook error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    botTokenConfigured: !!process.env.TELEGRAM_BOT_TOKEN,
    webhookEndpoint: '/api/webhooks/telegram',
  });
}
