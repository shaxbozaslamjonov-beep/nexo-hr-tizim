import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { role, email, firstName, lastName, department, position, telegramChatId, telegramUsername } = body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || user.companyId !== session.companyId) {
      return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });
    }

    const updateData: any = {};
    if (role) updateData.role = role;
    if (email) updateData.email = email;
    if (telegramChatId !== undefined) updateData.telegramChatId = telegramChatId || null;
    if (telegramUsername !== undefined) updateData.telegramUsername = telegramUsername || null;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        employeeProfile: {
          upsert: {
            create: {
              firstName: firstName || 'User',
              lastName: lastName || '',
              department: department || 'General',
              position: position || role || 'Staff',
              hireDate: new Date(),
            },
            update: {
              ...(firstName && { firstName }),
              ...(lastName && { lastName }),
              ...(department && { department }),
              ...(position && { position }),
            }
          }
        }
      },
      select: {
        id: true,
        email: true,
        role: true,
        employeeProfile: true,
      }
    });

    return NextResponse.json({ user: updatedUser, message: 'Foydalanuvchi ma\'lumotlari yangilandi' });

  } catch (error: any) {
    console.error('[Admin User PATCH Error]', error);
    return NextResponse.json({ error: 'Foydalanuvchini tahrirlashda xatolik' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { id } = await params;

    if (id === session.id) {
      return NextResponse.json({ error: 'O\'zingizning akkauntingizni o\'chira olmaysiz' }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { id }, select: { companyId: true } });
    if (!target || target.companyId !== session.companyId) {
      return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });
    }

    // Delete associated employee profile first if exists
    await prisma.employeeProfile.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ message: 'Foydalanuvchi o\'chirildi' });
  } catch (error: any) {
    console.error('[Admin User DELETE Error]', error);
    return NextResponse.json({ error: 'Foydalanuvchini o\'chirishda xatolik' }, { status: 500 });
  }
}
