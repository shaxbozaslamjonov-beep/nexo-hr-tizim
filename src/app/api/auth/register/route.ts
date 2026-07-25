import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { getDefaultCompanyId } from '@/lib/company';

export const dynamic = 'force-dynamic';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .substring(0, 40);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, role, phone, telegramUsername, companyName } = body;

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

    let targetCompanyId: string;

    if (companyName && (userRole === 'ADMIN' || userRole === 'HR_MANAGER' || userRole === 'DIRECTOR')) {
      const baseSlug = slugify(companyName) || 'company';
      let uniqueSlug = baseSlug;
      let counter = 1;
      while (await prisma.company.findUnique({ where: { slug: uniqueSlug } })) {
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      const newCompany = await prisma.company.create({
        data: {
          name: companyName.trim(),
          slug: uniqueSlug,
          plan: 'trial',
        },
      });
      targetCompanyId = newCompany.id;
    } else {
      targetCompanyId = await getDefaultCompanyId();
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: userRole,
        companyId: targetCompanyId,
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
            department: 'Boshqaruv',
            hireDate: new Date(),
          }
        } : undefined
      }
    });

    return NextResponse.json({ 
      message: 'User created successfully', 
      userId: user.id,
      companyId: targetCompanyId 
    }, { status: 201 });
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
