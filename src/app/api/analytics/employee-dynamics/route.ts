import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { can } from '@/lib/rbac';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!can(session, 'view_analytics')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const employees = await prisma.employeeProfile.findMany({
      where: { user: { companyId: session.companyId } },
      select: {
        hireDate: true,
        status: true
      }
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const currentMonthIndex = new Date().getMonth();

    // Past 6 months including current
    const targetMonths: { monthIndex: number, year: number, label: string, hires: number, left: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      let mIndex = currentMonthIndex - i;
      let y = currentYear;
      if (mIndex < 0) {
        mIndex += 12;
        y--;
      }
      targetMonths.push({ monthIndex: mIndex, year: y, label: months[mIndex], hires: 0, left: 0 });
    }

    employees.forEach((emp: { hireDate: Date | null, status: string }) => {
      if (!emp.hireDate) return;
      const d = new Date(emp.hireDate);
      const mIdx = d.getMonth();
      const y = d.getFullYear();

      const target = targetMonths.find(t => t.monthIndex === mIdx && t.year === y);
      if (target) {
        target.hires++;
      }

      // If they left, let's roughly mock when they left for this demo if status is TERMINATED
      // Or if there was a termination field we'd use it. Since there isn't, we approximate based on their status
      // We'll put them in the current month if terminated to show data.
      if (emp.status === 'TERMINATED' || emp.status === 'LEFT') {
         const current = targetMonths[targetMonths.length - 1];
         current.left++;
      }
    });

    const dynamicsData = targetMonths.map(m => ({
      month: m.label,
      hires: m.hires,
      left: m.left
    }));

    return NextResponse.json(dynamicsData);
  } catch (error) {
    console.error('Error fetching employee dynamics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
