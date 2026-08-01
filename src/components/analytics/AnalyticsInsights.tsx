import React from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { TrendingUp, TrendingDown, Users, AlertTriangle, CheckCircle2 } from 'lucide-react';
import fx from './effects.module.css';

interface AnalyticsInsightsProps {
  data?: {
    recruitmentGrowth?: { value: string; trend: string; applicationsThisMonth: number; applicationsLastMonth: number };
    retentionRate?: { value: string; trend: string; churnRate: number };
    actionRequired?: { value: number; count: number };
  } | null;
}

export function AnalyticsInsights({ data }: AnalyticsInsightsProps) {
  const { t } = useLanguage();

  if (!data) return null;

  const growth = data.recruitmentGrowth;
  const retention = data.retentionRate;
  const action = data.actionRequired;

  const growthUp = growth?.trend !== 'down';
  const growthDescription = growth && (growth.applicationsThisMonth > 0 || growth.applicationsLastMonth > 0)
    ? t('insights.recruitmentGrowth.description', {
        thisMonth: growth.applicationsThisMonth,
        lastMonth: growth.applicationsLastMonth,
      })
    : t('insights.recruitmentGrowth.descriptionEmpty');

  const actionCount = action?.count ?? 0;
  const actionDescription = actionCount > 0
    ? t('insights.actionRequired.description', { count: actionCount })
    : t('insights.actionRequired.descriptionEmpty');

  const insights = [
    {
      icon: growthUp ? <TrendingUp size={24} color="var(--emerald-600)" /> : <TrendingDown size={24} color="var(--red-600)" />,
      title: t('insights.recruitmentGrowth.title') || 'Рост рекрутмента',
      value: growth?.value ?? '+100%',
      description: growthDescription,
      iconBg: growthUp ? 'var(--emerald-50)' : 'var(--red-50)',
      badgeBg: growthUp ? 'var(--emerald-100)' : 'var(--red-100)',
      badgeColor: growthUp ? 'var(--emerald-700)' : 'var(--red-700)',
      borderColor: growthUp ? 'var(--emerald-100)' : 'var(--red-100)',
      badge: 'Trend',
    },
    {
      icon: <Users size={24} color="var(--primary)" />,
      title: t('insights.retentionRate.title') || 'Коэффициент удержания',
      value: retention?.value ?? '100%',
      description: retention ? t('insights.retentionRate.description', { churn: retention.churnRate }) : 'Текучесть кадров составляет 0%.',
      iconBg: 'var(--blue-50)',
      badgeBg: 'var(--blue-100)',
      badgeColor: 'var(--blue-800)',
      borderColor: 'var(--blue-100)',
      badge: 'Status',
    },
    {
      icon: actionCount > 0 ? <AlertTriangle size={24} color="var(--amber-600)" /> : <CheckCircle2 size={24} color="var(--emerald-600)" />,
      title: t('insights.actionRequired.title') || 'Требуется действие',
      value: String(actionCount || 1),
      description: actionDescription || 'Для 1 вакансий недостаточно кандидатов. Рекомендуется усилить рекламу.',
      iconBg: 'var(--amber-50)',
      badgeBg: 'var(--amber-100)',
      badgeColor: 'var(--amber-600)',
      borderColor: 'var(--amber-100)',
      badge: 'Alert',
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
      {insights.map((insight, idx) => (
        <div
          key={idx}
          className={fx.hoverLift}
          style={{
            background: 'var(--surface)',
            borderRadius: '24px',
            border: `1.5px solid ${insight.borderColor}`,
            padding: '1.75rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ padding: '0.75rem', borderRadius: '16px', background: insight.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {insight.icon}
            </div>
            <span style={{ padding: '0.3rem 0.75rem', borderRadius: '20px', background: insight.badgeBg, color: insight.badgeColor, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {insight.badge}
            </span>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              {insight.title}
            </h4>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.03em' }}>
              {insight.value}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.75rem', lineHeight: 1.5 }}>
              {insight.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
