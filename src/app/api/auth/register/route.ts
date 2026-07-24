import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { getDefaultCompanyId } from '@/lib/company';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, role, phone, telegramUsername } = body;

    if (!email || !password || !firstName || !lastName || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const normalizedTelegramUsername = telegramUsername
      ? String(telegramUsername).trim().replace(/^@/, '') || null
      : null;

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const userRole = role || 'CANDIDATE';
    const companyId = await getDefaultCompanyId();

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: userRole,
        companyId,
        phone,
        telegramUsername: normalizedTelegramUsername,
        candidateProfile: userRole === 'CANDIDATE' ? {
          create: {
            firstName,
            lastName,
            phone,
          }
        } : undefined,
        employeeProfile: userRole !== 'CANDIDATE' ? {
          create: {
            firstName,
            lastName,
            position: userRole,
            department: 'System', // Example default
            hireDate: new Date(),
          }
        } : undefined
      }
    });

    return NextResponse.json({ message: 'User created successfully', userId: user.id }, { status: 201 });
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
