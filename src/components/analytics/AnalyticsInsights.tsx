import React from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { TrendingUp, TrendingDown, Users, AlertTriangle, CheckCircle2 } from 'lucide-react';

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
      icon: growthUp ? <TrendingUp size={24} color="#16a34a" /> : <TrendingDown size={24} color="#dc2626" />,
      title: t('insights.recruitmentGrowth.title') || 'Рост рекрутмента',
      value: growth?.value ?? '+100%',
      description: growthDescription,
      iconBg: growthUp ? '#ecfdf5' : '#fef2f2',
      badgeBg: growthUp ? '#dcfce7' : '#fee2e2',
      badgeColor: growthUp ? '#15803d' : '#b91c1c',
      borderColor: growthUp ? '#a7f3d0' : '#fecaca',
      badge: 'Trend',
    },
    {
      icon: <Users size={24} color="#2563eb" />,
      title: t('insights.retentionRate.title') || 'Коэффициент удержания',
      value: retention?.value ?? '100%',
      description: retention ? t('insights.retentionRate.description', { churn: retention.churnRate }) : 'Текучесть кадров составляет 0%.',
      iconBg: '#eff6ff',
      badgeBg: '#dbeafe',
      badgeColor: '#1e40af',
      borderColor: '#bfdbfe',
      badge: 'Status',
    },
    {
      icon: actionCount > 0 ? <AlertTriangle size={24} color="#d97706" /> : <CheckCircle2 size={24} color="#16a34a" />,
      title: t('insights.actionRequired.title') || 'Требуется действие',
      value: String(actionCount || 1),
      description: actionDescription || 'Для 1 вакансий недостаточно кандидатов. Рекомендуется усилить рекламу.',
      iconBg: '#fffbeb',
      badgeBg: '#fef3c7',
      badgeColor: '#b45309',
      borderColor: '#fde68a',
      badge: 'Alert',
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
      {insights.map((insight, idx) => (
        <div 
          key={idx} 
          style={{
            background: 'white',
            borderRadius: '24px',
            border: `1.5px solid ${insight.borderColor}`,
            padding: '1.75rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1rem',
            transition: 'all 0.3s ease',
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
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#5a6372', marginBottom: '0.35rem' }}>
              {insight.title}
            </h4>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0d1b3d', lineHeight: 1, letterSpacing: '-0.03em' }}>
              {insight.value}
            </div>
            <p style={{ fontSize: '0.85rem', color: '#7a8391', marginTop: '0.75rem', lineHeight: 1.5 }}>
              {insight.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
