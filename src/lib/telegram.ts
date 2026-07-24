import { can } from './rbac';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8780931091:AAHW9_PWiStB0VACsJtyRPS8cF199DGHTNk';
const TELEGRAM_API_BASE = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nexo-hr-tizim.vercel.app';

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
 * Notify every user of a company who has linked their Telegram account
 * and holds one of the given roles (defaults to HR-facing roles).
 * Failures for individual recipients are swallowed so one bad chat ID
 * doesn't block the others.
 */
export async function notifyCompanyRoles(
  companyId: string,
  text: string,
  roles: string[] = ['HR_MANAGER', 'ADMIN', 'DIRECTOR']
): Promise<{ sent: number; failed: number }> {
  const prisma = (await import('./prisma')).default;
  const recipients = await prisma.user.findMany({
    where: { companyId, role: { in: roles }, telegramChatId: { not: null } },
    select: { telegramChatId: true },
  });

  let sent = 0;
  let failed = 0;
  for (const r of recipients) {
    if (!r.telegramChatId) continue;
    const result = await sendTelegramMessage({ chatId: r.telegramChatId, text });
    if (result.success) sent++;
    else failed++;
  }
  return { sent, failed };
}

/**
 * Auto-links an incoming chat to a User account by matching the Telegram
 * @username they registered with (case-insensitive). Only links accounts
 * that aren't already connected to a chat. On success, sends the user a
 * confirmation notification via the bot — this is the "avtomatik
 * bildirishnoma" promised at registration time when a telegram username
 * was provided (a chat_id can't be resolved from a bare username via the
 * Bot API until the user actually messages the bot, so linking happens
 * lazily on their first interaction rather than at registration).
 */
export async function tryAutoLinkByUsername(
  chatId: string | number,
  username: string | undefined | null
): Promise<boolean> {
  if (!username) return false;
  const prisma = (await import('./prisma')).default;

  const candidate = await prisma.user.findFirst({
    where: {
      telegramChatId: null,
      telegramUsername: { equals: username, mode: 'insensitive' },
    },
  });
  if (!candidate) return false;

  await prisma.user.update({
    where: { id: candidate.id },
    data: { telegramChatId: String(chatId), telegramLinkedAt: new Date() },
  });

  await sendTelegramMessage({
    chatId,
    text: `✅ <b>Akkauntingiz avtomatik ulandi!</b>\n\nRo'yxatdan o'tishda kiritgan Telegram username'ingiz orqali aniqlandik. Endi Nexo HR'dagi muhim yangiliklar (yangi arizalar, suhbatlar va h.k.) shu chatga keladi.`,
  });

  return true;
}

/**
 * Register bot commands menu with Telegram API (/setMyCommands).
 * When `scope` is provided the command list is set only for that chat
 * (so admins see `/ai` in their menu while regular users don't); with
 * no scope it sets the global default shown to unlinked/new chats.
 */
export async function setTelegramCommands(scope?: { chatId: string | number; includeAi: boolean }) {
  const commands = [
    { command: 'start', description: '🚀 Tizimni ishga tushirish & Bosh menyu' },
    { command: 'dashboard', description: '📊 HR Dashboard & Analitika' },
    { command: 'candidates', description: '💼 Nomzodlar & Otkliklar' },
    { command: 'vacancies', description: '📋 Vakansiyalar ro\'yxati' },
    { command: 'employees', description: '👥 Xodimlar boshqaruvi' },
    ...(scope?.includeAi ? [{ command: 'ai', description: '🤖 AI Yordamchi' }] : []),
    { command: 'faq', description: '❓ FAQ / Ko\'p beriladigan savollar' },
    { command: 'help', description: 'ℹ️ Yordam va Qo\'llab-quvvatlash' },
  ];

  try {
    const res = await fetch(`${TELEGRAM_API_BASE}/setMyCommands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        commands,
        scope: scope ? { type: 'chat', chat_id: scope.chatId } : undefined,
      }),
    });
    return await res.json();
  } catch (error: any) {
    return { ok: false, description: error.message };
  }
}

/**
 * Main Persistent Keyboard Layout (Reply Keyboard).
 * Buttons are gated per-role via rbac.ts `can()` so admins/HR/directors see
 * management tools and the AI Yordamchi button, while employees/candidates
 * (or unlinked chats) see a reduced, self-service menu.
 */
export function getTelegramMainKeyboard(role?: string | null) {
  const rows: any[][] = [];

  if (can(role, 'view_hr_dashboard')) {
    rows.push([{ text: '📊 Dashboard va Hisobot' }]);
  } else if (can(role, 'view_employee_dashboard') || can(role, 'view_candidate_dashboard')) {
    rows.push([{ text: '👤 Mening Profilim' }]);
  }

  const managementRow: any[] = [];
  if (can(role, 'manage_vacancies') || can(role, 'manage_candidates')) {
    managementRow.push({ text: '💼 Nomzodlar va Vakansiyalar' });
  }
  if (can(role, 'manage_employees')) {
    managementRow.push({ text: '👥 Xodimlar Boshqaruvi' });
  }
  if (managementRow.length) rows.push(managementRow);

  const toolsRow: any[] = [];
  if (can(role, 'view_analytics')) {
    toolsRow.push({ text: '📅 Davomat va KPI' });
  }
  if (can(role, 'use_ai_assistant')) {
    toolsRow.push({ text: '🤖 AI Yordamchi' });
  }
  if (toolsRow.length) rows.push(toolsRow);

  rows.push([
    { text: '❓ FAQ / Savol-Javoblar' },
    { text: '🌐 Tizimni O\'chish (Web App)', web_app: { url: `${APP_BASE_URL}/dashboard/hr` } }
  ]);

  return {
    keyboard: rows,
    resize_keyboard: true,
    persistent: true
  };
}

/**
 * Inline Keyboard shown while the bot is waiting for an AI Yordamchi question.
 */
export function getAiPromptInlineKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '❌ Bekor qilish', callback_data: 'ai_cancel' }]
    ]
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
