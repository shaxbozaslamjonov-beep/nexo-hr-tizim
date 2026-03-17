import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { TrendingUp, Users } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';

interface RecruitmentFunnelChartProps {
  data: {
    name: string;
    value: number;
    color?: string;
  }[];
}

const COLORS = {
  'Application': 'url(#colorApp)',
  'Screening': 'url(#colorScr)',
  'Interview': 'url(#colorInt)',
  'Training': 'url(#colorTra)',
  'Hired': 'url(#colorHir)'
};

export function RecruitmentFunnelChart({ data }: RecruitmentFunnelChartProps) {
  const { t } = useLanguage();

  const formattedData = data.map(item => {
    let localName = item.name;
    const stageKey = item.name.toLowerCase() as keyof typeof COLORS;
    const color = COLORS[item.name as keyof typeof COLORS] || '#94a3b8';
    
    const trans = t(`funnel.stages.${stageKey}`);
    if (trans && trans !== `funnel.stages.${stageKey}`) {
      localName = trans;
    }

    return {
      ...item,
      localName,
      fill: color
    };
  });

  const total = formattedData[0]?.value || 500; // Guaranteed data for visual impact

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const rate = ((data.value / total) * 100).toFixed(1);
      return (
        <div className="bg-white/95 backdrop-blur-xl border-none rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-5 text-sm min-w-[220px]">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-3 h-3 rounded-full" style={{ background: data.fill.replace('url(', '').replace(')', '') }} />
             <p className="font-extrabold text-slate-800 text-base uppercase tracking-tight">{data.localName}</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4 bg-slate-50 p-2 rounded-xl">
              <span className="text-slate-500 font-bold">{t('candidates.title')}:</span>
              <span className="font-black text-slate-900 text-lg">{data.value}</span>
            </div>
            <div className="flex items-center justify-between gap-4 px-2">
              <span className="text-slate-500 font-bold">{t('careerMaps.stats.progressToTarget') || 'Conversion'}:</span>
              <span className="font-black text-indigo-600">{rate}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full flex flex-col border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden bg-white/60 backdrop-blur-xl rounded-[2.5rem] group">
      <CardHeader className="flex flex-row items-center justify-between p-8 pb-2">
        <div>
          <CardTitle className="text-2xl font-black tracking-tighter flex items-center gap-3 text-slate-900">
            <div className="p-3 bg-indigo-500/10 rounded-2xl transition-transform group-hover:scale-110 duration-500">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            {t('recruitmentFunnel')}
          </CardTitle>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2 ml-1">Process Efficiency</p>
        </div>
        <div className="p-2 bg-slate-50 rounded-xl">
           <TrendingUp className="h-5 w-5 text-emerald-500" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-8 pt-6">
        <ResponsiveContainer width="100%" height="100%" minHeight={350}>
          <BarChart
            data={formattedData}
            layout="vertical"
            margin={{ top: 5, right: 60, left: 10, bottom: 5 }}
            barSize={40}
            barGap={12}
          >
            <defs>
              <linearGradient id="colorApp" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
              <linearGradient id="colorScr" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
              <linearGradient id="colorInt" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
              <linearGradient id="colorTra" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#f472b6" />
              </linearGradient>
              <linearGradient id="colorHir" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
            <XAxis type="number" hide />
            <YAxis 
              dataKey="localName" 
              type="category" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 800 }}
              width={140}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.01)' }} />
            <Bar dataKey="value" radius={[0, 20, 20, 0]} animationDuration={1500}>
              {formattedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
              <LabelList dataKey="value" position="right" fill="#1e293b" fontSize={14} fontWeight={900} offset={20} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
