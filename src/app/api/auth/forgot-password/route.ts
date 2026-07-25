import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { sendTelegramMessage } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

const TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes
const RESEND_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes

const GENERIC_MESSAGE =
  "Agar shu email tizimda ro'yxatdan o'tgan va Telegram ulangan bo'lsa, parolni tiklash havolasi Telegram chatingizga yuborildi.";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Always return the same generic response whether the account exists,
    // is linked to Telegram, or not — avoids leaking which emails are registered.
    const user = await prisma.user.findUnique({ where: { email } });

    if (user && user.telegramChatId) {
      const recentToken = await prisma.passwordResetToken.findFirst({
        where: { userId: user.id, usedAt: null, createdAt: { gte: new Date(Date.now() - RESEND_COOLDOWN_MS) } },
      });

      if (!recentToken) {
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

        await prisma.passwordResetToken.create({
          data: {
            userId: user.id,
            tokenHash,
            expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
          },
        });

        const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nexo-hr-tizim.vercel.app';
        const resetUrl = `${appBaseUrl}/login/reset?token=${rawToken}`;

        await sendTelegramMessage({
          chatId: user.telegramChatId,
          text: `🔐 <b>Parolni tiklash</b>\n\nQuyidagi havola orqali yangi parol o'rnating (15 daqiqa amal qiladi):\n${resetUrl}\n\nAgar buni siz so'ramagan bo'lsangiz, xabarni e'tiborsiz qoldiring.`,
        }).catch((err) => console.error('Password reset Telegram send error:', err));
      }
    }

    return NextResponse.json({ message: GENERIC_MESSAGE });
  } catch (error) {
    console.error('Forgot password error:', error);
    // Still return the generic message on unexpected errors to avoid leaking state.
    return NextResponse.json({ message: GENERIC_MESSAGE });
  }
}
