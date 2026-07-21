import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
      icon: growthUp ? <TrendingUp className="h-6 w-6 text-emerald-600" /> : <TrendingDown className="h-6 w-6 text-red-600" />,
      title: t('insights.recruitmentGrowth.title'),
      value: growth?.value ?? '—',
      description: growthDescription,
      color: growthUp ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700',
      badgeColor: growthUp ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800',
      borderLight: growthUp ? 'border-emerald-100' : 'border-red-100',
      badge: 'Trend',
    },
    {
      icon: <Users className="h-6 w-6 text-blue-600" />,
      title: t('insights.retentionRate.title'),
      value: retention?.value ?? '—',
      description: retention ? t('insights.retentionRate.description', { churn: retention.churnRate }) : '',
      color: 'bg-blue-50 text-blue-700',
      badgeColor: 'bg-blue-100 text-blue-800',
      borderLight: 'border-blue-100',
      badge: 'Status',
    },
    {
      icon: actionCount > 0 ? <AlertTriangle className="h-6 w-6 text-amber-600" /> : <CheckCircle2 className="h-6 w-6 text-amber-600" />,
      title: t('insights.actionRequired.title'),
      value: String(actionCount),
      description: actionDescription,
      color: 'bg-amber-50 text-amber-700',
      badgeColor: 'bg-amber-100 text-amber-800',
      borderLight: 'border-amber-100',
      badge: 'Alert',
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {insights.map((insight, idx) => (
        <Card key={idx} className={`border bg-card rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group hover:border-slate-300 ${insight.borderLight}`}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${insight.color} shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                {insight.icon}
              </div>
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${insight.badgeColor}`}>
                {insight.badge}
              </span>
            </div>
            <div className="space-y-2">
              <h4 className="text-[15px] font-semibold text-slate-700">{insight.title}</h4>
              <div className="text-3xl font-black text-slate-900 tracking-tight">{insight.value}</div>
              <p className="text-sm text-slate-500 leading-relaxed mt-2">{insight.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
