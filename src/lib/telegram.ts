const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8780931091:AAHW9_PWiStB0VACsJtyRPS8cF199DGHTNk';
const TELEGRAM_API_BASE = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export interface TelegramSendMessageOptions {
  chatId: string | number;
  text: string;
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  replyMarkup?: any;
}

/**
 * Send a message via Telegram Bot API
 */
export async function sendTelegramMessage(options: TelegramSendMessageOptions): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch(`${TELEGRAM_API_BASE}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: options.chatId,
        text: options.text,
        parse_mode: options.parseMode || 'HTML',
        reply_markup: options.replyMarkup,
      }),
    });

    const data = await res.json();
    if (!data.ok) {
      console.error('[Telegram API Error]', data);
      return { success: false, error: data.description || 'Failed to send Telegram message' };
    }

    return { success: true, data: data.result };
  } catch (error: any) {
    console.error('[Telegram Service Exception]', error);
    return { success: false, error: error.message || 'Network exception sending Telegram message' };
  }
}

/**
 * Send formatted notification for candidate application
 */
export async function notifyNewCandidate(chatId: string | number, candidate: { name: string; vacancy: string; phone?: string; email?: string }) {
  const text = `
<b>🚀 Yangi Nomzod Topshirig'i!</b>

👤 <b>Ism:</b> ${candidate.name}
💼 <b>Vakansiya:</b> ${candidate.vacancy}
📞 <b>Tel:</b> ${candidate.phone || 'Ko\'rsatilmagan'}
📧 <b>Email:</b> ${candidate.email || 'Ko\'rsatilmagan'}

<i>Nexo HR Platformasi orqali yuborildi.</i>
  `.trim();

  return sendTelegramMessage({ chatId, text });
}

/**
 * Send OTP Code or Password Reset notification
 */
export async function sendSecurityNotification(chatId: string | number, title: string, details: string) {
  const text = `
<b>🔒 Xavfsizlik Bildirishnomasi: ${title}</b>

${details}

⏱ <i>Vaqt: ${new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })}</i>
  `.trim();

  return sendTelegramMessage({ chatId, text });
}

/**
 * Register Webhook with Telegram
 */
export async function setTelegramWebhook(webhookUrl: string) {
  try {
    const res = await fetch(`${TELEGRAM_API_BASE}/setWebhook?url=${encodeURIComponent(webhookUrl)}`);
    const data = await res.json();
    return data;
  } catch (error: any) {
    return { ok: false, description: error.message };
  }
}
