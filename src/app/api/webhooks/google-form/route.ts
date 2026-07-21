import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { getDefaultCompanyId } from '@/lib/company';

export async function POST(request: Request) {
  try {
    const secret = request.headers.get('x-webhook-secret');
    if (process.env.WEBHOOK_SECRET && secret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, email, phone, position } = body;

    if (!fullName || !email) {
      return NextResponse.json({ error: 'Full name and email are required' }, { status: 400 });
    }

    // Split name safely
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '-';

    // 1. Create User
    const existingUser = await prisma.user.findUnique({ where: { email } });
    
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists', userId: existingUser.id }, { status: 200 });
    }

    // Generate a secure random-ish password or use a placeholder
    const tempPassword = Math.random().toString(36).slice(-10);
    const hashedPassword = await hashPassword(tempPassword);

    const companyId = await getDefaultCompanyId();
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'CANDIDATE',
        companyId,
      }
    });

    // 2. Create Candidate Profile
    const candidateProfile = await prisma.candidateProfile.create({
      data: {
        userId: user.id,
        firstName,
        lastName,
        phone: phone || null,
        source: 'Google Form',
        status: 'NEW',
      }
    });

    // 3. Optional: Link to vacancy if position matches
    if (position) {
      const vacancy = await prisma.vacancy.findFirst({
        where: {
          companyId,
          title: {
            contains: position
          }
        }
      });

      if (vacancy) {
        await prisma.application.create({
          data: {
            candidateId: candidateProfile.id,
            vacancyId: vacancy.id,
            stage: 'APPLIED',
          }
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Candidate registered from Google Forms',
      candidateId: candidateProfile.id 
    }, { status: 201 });

  } catch (error) {
    console.error('Google Form Webhook Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
