import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Activity } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

interface EmployeeDynamicsChartProps {
  data: {
    month: string;
    hires: number;
    left: number;
  }[];
}

export function EmployeeDynamicsChart({ data }: EmployeeDynamicsChartProps) {
  const { t } = useLanguage();

  const formattedData = data.length > 0 ? data : [
    { month: 'Yan', hires: 12, left: 4 },
    { month: 'Fev', hires: 18, left: 6 },
    { month: 'Mar', hires: 15, left: 8 },
    { month: 'Apr', hires: 25, left: 5 },
    { month: 'May', hires: 32, left: 7 },
    { month: 'Iyun', hires: 28, left: 10 },
  ];

  return (
    <Card className="h-full flex flex-col border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden bg-white/60 backdrop-blur-xl rounded-[2.5rem] group">
      <CardHeader className="flex flex-row items-center justify-between p-8 pb-2">
        <div>
          <CardTitle className="text-2xl font-black tracking-tighter flex items-center gap-3 text-slate-900">
            <div className="p-3 bg-indigo-500/10 rounded-2xl transition-transform group-hover:scale-110 duration-500">
              <Activity className="h-6 w-6 text-indigo-600" />
            </div>
            {t('careerMaps.stats.monthlyGrowth') || 'Xodimlar dinamikasi'}
          </CardTitle>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2 ml-1">Staffing Trends over time</p>
        </div>
        <div className="flex gap-2">
           <div className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-wider">Growth +15%</div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-8 pt-6">
        <ResponsiveContainer width="100%" height="100%" minHeight={350}>
          <AreaChart
            data={formattedData}
            margin={{ top: 20, right: 30, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorHires" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorLeft" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} 
              dy={15}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} 
              dx={-10}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', padding: '16px' }}
              itemStyle={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase' }}
              labelStyle={{ color: '#1e293b', marginBottom: '12px', fontWeight: 900, fontSize: '16px' }}
            />
            <Legend verticalAlign="top" height={48} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 800, paddingBottom: '30px', textTransform: 'uppercase', letterSpacing: '0.05em' }}/>
            <Area 
              type="monotone" 
              dataKey="hires" 
              name={t('analytics.employeeDynamics.hired') || 'Qabul qilingan'} 
              stroke="#4f46e5" 
              strokeWidth={5}
              fillOpacity={1} 
              fill="url(#colorHires)" 
              activeDot={{ r: 8, strokeWidth: 0, fill: '#4f46e5' }}
              animationDuration={2000}
            />
            <Area 
              type="monotone" 
              dataKey="left" 
              name={t('analytics.employeeDynamics.left') || 'Ketgan'} 
              stroke="#ec4899" 
              strokeWidth={5}
              fillOpacity={1} 
              fill="url(#colorLeft)" 
              activeDot={{ r: 8, strokeWidth: 0, fill: '#ec4899' }}
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
