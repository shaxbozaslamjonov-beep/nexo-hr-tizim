const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8780931091:AAHW9_PWiStB0VACsJtyRPS8cF199DGHTNk';
const TELEGRAM_API_BASE = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
const APP_BASE_URL = 'https://nexo-hr-tizim-5fe5.vercel.app';

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
 * Register bot commands menu with Telegram API (/setMyCommands)
 */
export async function setTelegramCommands() {
  const commands = [
    { command: 'start', description: '🚀 Tizimni ishga tushirish & Bosh menyu' },
    { command: 'dashboard', description: '📊 HR Dashboard & Analitika' },
    { command: 'candidates', description: '💼 Nomzodlar & Otkliklar' },
    { command: 'vacancies', description: '📋 Vakansiyalar ro\'yxati' },
    { command: 'employees', description: '👥 Xodimlar boshqaruvi' },
    { command: 'faq', description: '❓ FAQ / Ko\'p beriladigan savollar' },
    { command: 'help', description: 'ℹ️ Yordam va Qo\'llab-quvvatlash' },
  ];

  try {
    const res = await fetch(`${TELEGRAM_API_BASE}/setMyCommands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commands }),
    });
    return await res.json();
  } catch (error: any) {
    return { ok: false, description: error.message };
  }
}

/**
 * Main Persistent Keyboard Layout (Reply Keyboard)
 */
export function getTelegramMainKeyboard() {
  return {
    keyboard: [
      [
        { text: '📊 Dashboard va Hisobot' },
        { text: '💼 Nomzodlar va Vakansiyalar' }
      ],
      [
        { text: '👥 Xodimlar Boshqaruvi' },
        { text: '📅 Davomat va KPI' }
      ],
      [
        { text: '❓ FAQ / Savol-Javoblar' },
        { text: '🌐 Tizimni O\'chish (Web App)', web_app: { url: `${APP_BASE_URL}/dashboard/hr` } }
      ]
    ],
    resize_keyboard: true,
    persistent: true
  };
}

/**
 * Inline Keyboard Buttons for Welcome Message
 */
export function getWelcomeInlineKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '🚀 Nexo HR Platformasini Ochish', url: `${APP_BASE_URL}/dashboard/hr` }
      ],
      [
        { text: '❓ FAQ / Savol-Javoblar', callback_data: 'faq_main' },
        { text: '📞 Qo\'llab-quvvatlash', callback_data: 'support_contact' }
      ]
    ]
  };
}

/**
 * Inline Keyboard Buttons for FAQ Questions
 */
export function getFAQInlineKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '1. Nexo HR nima va vazifasi nima?', callback_data: 'faq_1' }],
      [{ text: '2. Yangi nomzod va vakansiya yaratish', callback_data: 'faq_2' }],
      [{ text: '3. Telegram xabarnomalarini yoqish', callback_data: 'faq_3' }],
      [{ text: '4. RBAC ruxsatnomalari va xavfsizlik', callback_data: 'faq_4' }],
      [{ text: '5. Parolni tiklash va kirish', callback_data: 'faq_5' }],
      [{ text: '🔙 Asosiy Menyu', callback_data: 'menu_main' }]
    ]
  };
}

/**
 * Register Webhook with Telegram
 */
export async function setTelegramWebhook(webhookUrl: string) {
  try {
    // Set commands first
    await setTelegramCommands();
    const res = await fetch(`${TELEGRAM_API_BASE}/setWebhook?url=${encodeURIComponent(webhookUrl)}`);
    const data = await res.json();
    return data;
  } catch (error: any) {
    return { ok: false, description: error.message };
  }
}
