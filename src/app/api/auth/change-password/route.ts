import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { comparePassword, hashPassword } from '@/lib/password';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { oldPassword, newPassword } = await request.json();
    if (!oldPassword || !newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const valid = await comparePassword(oldPassword, user.password);
    if (!valid) return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });

    const hashed = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

    return NextResponse.json({ message: 'Password updated' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  }
}
