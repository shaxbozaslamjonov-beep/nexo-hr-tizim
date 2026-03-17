import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { TrendingUp, Users, AlertTriangle } from 'lucide-react';

interface AnalyticsInsightsProps {
  data?: {
    recruitmentGrowth?: { value: string; trend: string };
    retentionRate?: { value: string; trend: string };
    actionRequired?: { value: string; count: number };
  };
}

export function AnalyticsInsights({ data }: AnalyticsInsightsProps) {
  const { t } = useLanguage();

  const insights = [
    {
      icon: <TrendingUp className="h-6 w-6 text-emerald-600" />,
      title: t('insights.recruitmentGrowth.title') || "Rekrutment o'sishi",
      value: data?.recruitmentGrowth?.value || "+12.5%",
      description: t('insights.recruitmentGrowth.description') || "Nomzodlar oqimi o'tgan oyga nisbatan 12% ga oshdi.",
      color: "bg-emerald-50 text-emerald-700",
      badgeColor: "bg-emerald-100 text-emerald-800",
      borderLight: "border-emerald-100"
    },
    {
      icon: <Users className="h-6 w-6 text-blue-600" />,
      title: t('insights.retentionRate.title') || "Xodimlarni saqlab qolish",
      value: data?.retentionRate?.value || "96.8%",
      description: t('insights.retentionRate.description') || "Xodimlar almashinuvi (churn rate) past darajada (3.2%).",
      color: "bg-blue-50 text-blue-700",
      badgeColor: "bg-blue-100 text-blue-800",
      borderLight: "border-blue-100"
    },
    {
      icon: <AlertTriangle className="h-6 w-6 text-amber-600" />,
      title: t('insights.actionRequired.title') || "Harakat talab etiladi",
      value: data?.actionRequired?.value || "3 ta vakansiya",
      description: t('insights.actionRequired.description') || "3 ta vakansiya uchun nomzodlar yetarli emas. Reklamani kuchaytiring.",
      color: "bg-amber-50 text-amber-700",
      badgeColor: "bg-amber-100 text-amber-800",
      borderLight: "border-amber-100"
    }
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
                {idx === 0 ? 'Trend' : idx === 1 ? 'Status' : 'Alert'}
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
