'use client';

import React from 'react';
import Link from 'next/link';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Filter, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface VacancyStatusChartProps {
  data: {
    name: string;
    value: number;
  }[];
}

const COLORS = ['#10b981', '#f59e0b', '#6b7280']; // Green (Open), Orange (Pending), Gray (Closed)

export function VacancyStatusChart({ data }: VacancyStatusChartProps) {
  const { t } = useLanguage();

  const baseData = data;
  const hasData = baseData.some((d) => d.value > 0);

  const localizedNames: Record<string, string> = {
    'Open': t('analytics.vacancyStatus.open') || 'Ochiq',
    'Pending': t('analytics.vacancyStatus.pending') || 'Kutilmoqda',
    'Closed': t('analytics.vacancyStatus.closed') || 'Yopiq'
  };

  const formattedData = baseData.map(item => ({
    ...item,
    localName: localizedNames[item.name] || item.name
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-xl border-none rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-4 text-sm">
          <p className="font-extrabold text-slate-800 mb-1 uppercase tracking-tight">{payload[0].payload.localName}</p>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold">{t('vacancies.title')}:</span>
            <span className="font-black text-slate-900 text-lg">{payload[0].value}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full flex flex-col border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden bg-white/60 backdrop-blur-xl rounded-[2.5rem] group">
      <CardHeader className="p-8 pb-2">
        <CardTitle className="text-2xl font-black tracking-tighter flex items-center gap-3 text-slate-900">
          <div className="p-3 bg-emerald-500/10 rounded-2xl transition-transform group-hover:scale-110 duration-500">
            <Filter className="h-6 w-6 text-emerald-600" />
          </div>
          {t('analytics.vacancyStatus.title')}
        </CardTitle>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2 ml-1">Current Distribution</p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center p-8 pt-2 pb-2">
        {!hasData ? (
          <div className="flex items-center justify-center h-[280px] w-full text-sm text-slate-400 font-medium">
            {t('analytics.noData')}
          </div>
        ) : (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={formattedData}
              cx="50%"
              cy="50%"
              innerRadius={75}
              outerRadius={95}
              paddingAngle={8}
              dataKey="value"
              nameKey="localName"
              stroke="none"
              cornerRadius={12}
              animationBegin={200}
              animationDuration={1500}
            >
              {formattedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }} />
          </PieChart>
        </ResponsiveContainer>
        )}
      </CardContent>
      <CardFooter className="p-8 pt-0 pb-6 flex justify-center mt-auto">
        <Link href="/dashboard/hr/vacancies" className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 rounded-2xl text-sm font-black text-slate-700 hover:bg-slate-100 transition-all group/btn">
          {t('vacancies.viewApplications') || "Batafsil ko'rish"}
          <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </CardFooter>
    </Card>
  );
}
