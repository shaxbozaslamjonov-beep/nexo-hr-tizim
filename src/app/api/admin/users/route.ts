import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { hashPassword } from '@/lib/password';
import { getDefaultCompanyId } from '@/lib/company';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        employeeProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
            position: true,
          }
        }
      }
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('[Admin Users GET Error]', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, firstName, lastName, role, department, position } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'F.I.Sh, Email va Parol majburiy' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Ushbu email bilan foydalanuvchi allaqachon mavjud' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const companyId = await getDefaultCompanyId();

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role || 'EMPLOYEE',
        companyId,
        employeeProfile: {
          create: {
            firstName,
            lastName,
            department: department || 'General',
            position: position || role || 'Staff',
            hireDate: new Date(),
          }
        }
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        employeeProfile: true,
      }
    });

    return NextResponse.json({ user: newUser, message: 'Foydalanuvchi muvaffaqiyatli yaratildi' });
  } catch (error: any) {
    console.error('[Admin Users POST Error]', error);
    return NextResponse.json({ error: error.message || 'Foydalanuvchi yaratishda xatolik' }, { status: 500 });
  }
}
