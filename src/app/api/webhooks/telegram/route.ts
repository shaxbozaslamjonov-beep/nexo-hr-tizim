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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const setup = searchParams.get('setup');
  const host = request.headers.get('host') || 'nexo-hr-tizim-5fe5.vercel.app';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const webhookUrl = `${protocol}://${host}/api/webhooks/telegram`;

  if (setup === 'true') {
    const { setTelegramWebhook } = await import('@/lib/telegram');
    const result = await setTelegramWebhook(webhookUrl);
    return NextResponse.json({
      success: result.ok,
      webhookUrl,
      result
    });
  }

  return NextResponse.json({
    status: 'online',
    botTokenConfigured: true,
    webhookEndpoint: '/api/webhooks/telegram',
    configuredUrl: webhookUrl,
  });
}

