import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { BrainCircuit } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from 'recharts';

interface CandidateSkillsChartProps {
  data?: {
    total: number;
    computerSkill: { name: string; value: number }[];
    education: { name: string; value: number }[];
  } | null;
}

const SKILL_COLORS: Record<string, string> = {
  none: '#cbd5e1',
  basic: '#818cf8',
  advanced: '#4f46e5',
};

export function CandidateSkillsChart({ data }: CandidateSkillsChartProps) {
  const { t } = useLanguage();

  const skillLabels: Record<string, string> = {
    none: t('apply.computerSkills.none') || 'None',
    basic: t('apply.computerSkills.basic') || 'Basic',
    advanced: t('apply.computerSkills.advanced') || 'Advanced',
  };

  const chartData = (data?.computerSkill || []).map((d) => ({
    ...d,
    label: skillLabels[d.name] || d.name,
  }));

  const hasData = (data?.total || 0) > 0;

  return (
    <Card className="h-full border-none shadow-md overflow-hidden bg-gradient-to-br from-card to-muted/20">
      <CardHeader className="pb-0">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <div className="p-2 bg-indigo-500/10 rounded-xl transition-colors group-hover:bg-indigo-500/20">
            <BrainCircuit className="h-5 w-5 text-indigo-500" />
          </div>
          {t('analytics.candidateSkills.title') || "Nomzodlar ko'nikma darajasi"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {hasData ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 24, right: 24, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(4px)' }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={64}>
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={SKILL_COLORS[entry.name] || '#4f46e5'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[280px] text-sm text-slate-400 font-medium px-6 text-center">
            {t('analytics.noData') || "Hozircha ko'rsatish uchun nomzod ma'lumotlari yo'q"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
