import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { sendTelegramMessage } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

// GET - current user's Telegram link status
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const user = await (prisma.user as any).findUnique({
      where: { id: session.id },
    });

    return NextResponse.json({
      telegramChatId: user?.telegramChatId || null,
      telegramUsername: user?.telegramUsername || null,
      telegramLinkedAt: user?.telegramLinkedAt || null,
    });
  } catch (e) {
    return NextResponse.json({ telegramChatId: null, telegramUsername: null });
  }
}

// POST - link the caller's account to a Telegram chat ID
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { chatId } = await request.json();
    const normalized = String(chatId ?? '').trim();
    if (!normalized || !/^-?\d+$/.test(normalized)) {
      return NextResponse.json({ error: 'Telegram Chat ID raqam bo\'lishi kerak', code: 'invalid_chat_id' }, { status: 400 });
    }

    const existing = await (prisma.user as any).findFirst({ 
      where: { telegramChatId: normalized } 
    });
    if (existing && existing.id !== session.id) {
      return NextResponse.json({ error: 'Bu Chat ID boshqa akkauntga ulangan', code: 'chat_id_taken' }, { status: 409 });
    }

    const sendResult = await sendTelegramMessage({
      chatId: normalized,
      text: `✅ <b>Akkaunt muvaffaqiyatli ulandi!</b>\n\nEndi Nexo HR'dagi muhim yangiliklar (yangi arizalar, suhbatlar va h.k.) shu chatga keladi.`,
    });

    if (!sendResult.success) {
      return NextResponse.json(
        { error: 'Botga xabar yuborib bo\'lmadi. Avval botga /start yuboring.', code: 'send_failed' },
        { status: 400 }
      );
    }

    const updated = await (prisma.user as any).update({
      where: { id: session.id },
      data: { telegramChatId: normalized, telegramLinkedAt: new Date() },
    });

    return NextResponse.json({
      telegramChatId: updated.telegramChatId,
      telegramUsername: updated.telegramUsername,
      telegramLinkedAt: updated.telegramLinkedAt
    });
  } catch (error) {
    console.error('Telegram link error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - unlink Telegram
export async function DELETE() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await (prisma.user as any).update({
      where: { id: session.id },
      data: { telegramChatId: null, telegramUsername: null, telegramLinkedAt: null },
    });
  } catch (e) {
    // Ignore if fields optional
  }

  return NextResponse.json({ message: 'Unlinked' });
}
