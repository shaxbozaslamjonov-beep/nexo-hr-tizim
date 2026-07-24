import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Users, Briefcase, GraduationCap, FileText, Target, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardsProps {
  stats: {
    candidates: number;
    vacancies: number;
    lessons: number;
    testResults: number;
  };
  targets: {
    candidatesTarget: number;
    vacanciesTarget: number;
    lessonsTarget: number;
    testResultsTarget: number;
  };
  trends?: {
    candidates?: number | null;
    vacancies?: number | null;
  };
}

export function StatsCards({ stats, targets, trends }: StatsCardsProps) {
  const { t } = useLanguage();

  const cards = [
    {
      title: t('candidates.title'),
      value: stats.candidates ?? 0,
      target: targets.candidatesTarget || 150,
      icon: <Users className="h-6 w-6 text-white" />,
      gradient: "from-blue-500 to-indigo-600",
      trend: trends?.candidates ?? null,
      href: "/dashboard/hr/candidates",
      hoverBorder: "hover:border-indigo-200"
    },
    {
      title: t('vacancies.title'),
      value: stats.vacancies ?? 0,
      target: targets.vacanciesTarget || 12,
      icon: <Briefcase className="h-6 w-6 text-white" />,
      gradient: "from-emerald-400 to-teal-600",
      trend: trends?.vacancies ?? null,
      href: "/dashboard/hr/vacancies",
      hoverBorder: "hover:border-teal-200"
    },
    {
      title: t('lessons'),
      value: stats.lessons ?? 0,
      target: targets.lessonsTarget || 60,
      icon: <GraduationCap className="h-6 w-6 text-white" />,
      gradient: "from-amber-400 to-orange-500",
      trend: null,
      href: "/dashboard/hr/lessons",
      hoverBorder: "hover:border-orange-200"
    },
    {
      title: t('tests.results') || 'Test Natijalari',
      value: stats.testResults ?? 0,
      target: targets.testResultsTarget || 200,
      icon: <FileText className="h-6 w-6 text-white" />,
      gradient: "from-purple-500 to-fuchsia-600",
      trend: null,
      href: "/dashboard/hr/tests",
      hoverBorder: "hover:border-fuchsia-200"
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => {
        const progress = Math.min((card.value / card.target) * 100, 100);
        const trendUp = (card.trend ?? 0) >= 0;
        return (
          <Link key={idx} href={card.href} className="group block">
            <Card className={`rounded-[2rem] border-none bg-card/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-2 border-transparent ${card.hoverBorder} relative overflow-hidden`}>
              {/* Subtle background glow */}
              <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${card.gradient} opacity-[0.03] rounded-full blur-3xl group-hover:opacity-[0.08] transition-opacity duration-500`} />

              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className={`p-4 rounded-2xl shadow-lg bg-gradient-to-br ${card.gradient} group-hover:scale-110 transition-transform duration-500`}>
                    {card.icon}
                  </div>
                  {card.trend !== null && (
                    <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase ${trendUp ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                      {trendUp ? '+' : ''}{card.trend}%
                      {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">{card.value}</h3>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{card.title}</p>
                    <ArrowRight className="h-5 w-5 text-slate-400 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5" />
                      TARGET: {card.target}
                    </span>
                    <span className="text-slate-600">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${card.gradient}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
