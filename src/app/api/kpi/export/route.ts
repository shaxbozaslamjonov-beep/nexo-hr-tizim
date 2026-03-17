import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as xlsx from 'xlsx';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'excel';

    const kpiEntries = await prisma.kPIEntry.findMany({
      include: {
        kpi: true,
        employee: {
          include: {
            user: true
          }
        }
      },
      orderBy: { periodDate: 'desc' }
    });

    const data = kpiEntries.map(entry => ({
      'Xodim F.I.Sh': `${entry.employee.firstName} ${entry.employee.lastName}`,
      'KPI Nomi': entry.kpi.name,
      'Maqsadli Qiymat': entry.kpi.targetValue,
      'Haqiqiy Qiymat': entry.value,
      'Davr': new Date(entry.periodDate).toISOString().split('T')[0],
      'Reyting': entry.rating || '-'
    }));

    if (data.length === 0) {
      data.push({
        'Xodim F.I.Sh': 'No Data',
        'KPI Nomi': '-',
        'Maqsadli Qiymat': 0,
        'Haqiqiy Qiymat': 0,
        'Davr': '-',
        'Reyting': '-'
      });
    }

    if (format === 'excel' || format === 'csv') {
      const ws = xlsx.utils.json_to_sheet(data);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, 'KPI_Report');
      
      const buffer = xlsx.write(wb, { type: 'buffer', bookType: format === 'excel' ? 'xlsx' : 'csv' });
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv',
          'Content-Disposition': `attachment; filename="kpi_report.${format === 'excel' ? 'xlsx' : 'csv'}"`
        }
      });
    } else if (format === 'pdf') {
       // Since PDF generation is complex without heavy external dependencies, we generate a CSV representation
      const ws = xlsx.utils.json_to_sheet(data);
      const csv = xlsx.utils.sheet_to_csv(ws);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="kpi_report_pdf_fallback.csv"'
        }
      });
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
