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
  none: 'var(--gray-300)',
  basic: 'var(--blue-500)',
  advanced: 'var(--primary)',
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
      background: 'var(--surface)',
      borderRadius: '24px',
      border: '1px solid var(--border)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '420px',
    }}>
      {/* Header */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(46, 86, 230, 0.25)' }}>
          <BrainCircuit size={22} color="white" />
        </div>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>
            {t('analytics.candidateSkills.title') || "Уровень компьютерной грамотности"}
          </h3>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0.25rem 0 0 0' }}>
            Skill Breakdown
          </p>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '300px' }}>
        {!hasData ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
            {t('analytics.noData') || 'Nomzod ko\'nikmalari bo\'yicha ma\'lumot yo\'q'}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '14px', border: '1px solid var(--border)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}
              />
              <Bar dataKey="value" radius={[10, 10, 0, 0]} maxBarSize={50}>
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={SKILL_COLORS[entry.name] || 'var(--primary)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
