import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword } from '@/lib/password';
import { signToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        candidateProfile: true,
        employeeProfile: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Generate token
    const token = await signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    });

    const firstName = user.employeeProfile?.firstName || user.candidateProfile?.firstName || 'User';
    const lastName = user.employeeProfile?.lastName || user.candidateProfile?.lastName || '';

    const response = NextResponse.json({ 
      message: 'Login successful',
      id: user.id,
      email: user.email,
      role: user.role,
      firstName,
      lastName
    }, { status: 200 });

    // Set cookie
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Local tunnel might not always have HTTPS correctly detected by Node
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login Error:', error);
    return NextResponse.json({ 
      error: error?.message?.includes('DATABASE') || error?.message?.includes('Prisma') 
        ? 'Ma\'lumotlar bazasiga ulanishda xatolik (DATABASE_URL ni Vercel-da tekshiring)' 
        : (error.message || 'Internal server error') 
    }, { status: 500 });
  }
}

