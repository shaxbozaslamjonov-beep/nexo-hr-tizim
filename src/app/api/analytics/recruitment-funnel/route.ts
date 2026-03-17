import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const candidates = await prisma.candidateProfile.findMany({
      select: {
        status: true
      }
    });

    // We will group by expected status concepts:
    // Application (NEW + APPLIED)
    // Screening (SCREENING)
    // Interview (INTERVIEW)
    // Training / Pending (TRAINING, PENDING, OFFER)
    // Hired (HIRED)
    
    // Note: status from db could vary, but generally 'NEW', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'
    
    let applications = 0;
    let screening = 0;
    let interview = 0;
    let training = 0;
    let hired = 0;

    applications = candidates.length; // total candidates starting the funnel
    
    candidates.forEach((c: { status: string }) => {
      const s = c.status.toUpperCase();
      // Assume anyone that advanced passed a stage counts towards that stage in funnel
      if (['SCREENING', 'INTERVIEW', 'OFFER', 'TRAINING', 'HIRED', 'RESERVE'].includes(s)) {
        screening++;
      }
      if (['INTERVIEW', 'OFFER', 'TRAINING', 'HIRED'].includes(s)) {
        interview++;
      }
      if (['OFFER', 'TRAINING', 'HIRED'].includes(s)) {
        training++;
      }
      if (s === 'HIRED') {
        hired++;
      }
    });

    const funnelData = [
      { name: 'Application', value: applications },
      { name: 'Screening', value: screening },
      { name: 'Interview', value: interview },
      { name: 'Training', value: training },
      { name: 'Hired', value: hired }
    ];

    return NextResponse.json(funnelData);
  } catch (error) {
    console.error('Error fetching funnel data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
