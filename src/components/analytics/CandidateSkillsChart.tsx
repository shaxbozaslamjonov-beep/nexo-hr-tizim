import React from 'react';
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
  basic: '#60a5fa',
  advanced: '#2563eb',
};

export function CandidateSkillsChart({ data }: CandidateSkillsChartProps) {
  const { t } = useLanguage();

  const skillLabels: Record<string, string> = {
    none: t('apply.computerSkills.none') || 'Yo\'q (None)',
    basic: t('apply.computerSkills.basic') || 'O\'rta (Basic)',
    advanced: t('apply.computerSkills.advanced') || 'Yuqori (Advanced)',
  };

  const chartData = (data?.computerSkill || []).map((d) => ({
    ...d,
    label: skillLabels[d.name] || d.name,
  }));

  const hasData = (data?.total || 0) > 0;

  return (
    <div style={{
      background: 'white',
      borderRadius: '24px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '420px',
    }}>
      {/* Header */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)' }}>
          <BrainCircuit size={22} color="white" />
        </div>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0d1b3d', margin: 0, lineHeight: 1.2 }}>
            {t('analytics.candidateSkills.title') || "Уровень компьютерной грамотности"}
          </h3>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0.25rem 0 0 0' }}>
            Skill Breakdown
          </p>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '300px' }}>
        {!hasData ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>
            {t('analytics.noData') || 'Nomzod ko\'nikmalari bo\'yicha ma\'lumot yo\'q'}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#475569', fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', backgroundColor: 'white' }}
              />
              <Bar dataKey="value" radius={[10, 10, 0, 0]} maxBarSize={50}>
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={SKILL_COLORS[entry.name] || '#2563eb'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
