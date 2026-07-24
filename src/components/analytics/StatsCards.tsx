import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Users, Briefcase, GraduationCap, FileText, Target, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';

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
      title: t('candidates.title') || 'КАНДИДАТЫ',
      value: stats.candidates ?? 0,
      target: targets.candidatesTarget || 150,
      icon: <Users size={22} color="white" />,
      gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
      trend: trends?.candidates ?? null,
      href: "/dashboard/hr/candidates",
    },
    {
      title: t('vacancies.title') || 'Вакансии',
      value: stats.vacancies ?? 0,
      target: targets.vacanciesTarget || 12,
      icon: <Briefcase size={22} color="white" />,
      gradient: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
      trend: trends?.vacancies ?? null,
      href: "/dashboard/hr/vacancies",
    },
    {
      title: t('lessons') || 'Уроки',
      value: stats.lessons ?? 0,
      target: targets.lessonsTarget || 60,
      icon: <GraduationCap size={22} color="white" />,
      gradient: "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)",
      trend: null,
      href: "/dashboard/hr/lessons",
    },
    {
      title: t('tests.results') || 'Результаты',
      value: stats.testResults ?? 0,
      target: targets.testResultsTarget || 200,
      icon: <FileText size={22} color="white" />,
      gradient: "linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)",
      trend: null,
      href: "/dashboard/hr/tests",
    }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
      {cards.map((card, idx) => {
        const progress = Math.min((card.value / card.target) * 100, 100);
        const trendUp = (card.trend ?? 0) >= 0;
        return (
          <Link key={idx} href={card.href} style={{ textDecoration: 'none', display: 'block' }}>
            <div
              style={{
                background: 'white',
                borderRadius: '24px',
                border: '1px solid #e2e8f0',
                padding: '1.75rem',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1.25rem',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Header Icon + Trend Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: card.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(0,0,0,0.12)' }}>
                  {card.icon}
                </div>
                {card.trend !== null && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.3rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, background: trendUp ? '#dcfce7' : '#fee2e2', color: trendUp ? '#15803d' : '#b91c1c' }}>
                    {trendUp ? '+' : ''}{card.trend}%
                    {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  </div>
                )}
              </div>

              {/* Number + Title */}
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0d1b3d', lineHeight: 1, letterSpacing: '-0.03em' }}>
                  {card.value}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#5a6372', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {card.title}
                  </span>
                  <ArrowRight size={18} color="#94a3b8" />
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '0.4rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Target size={14} />
                    TARGET: {card.target}
                  </span>
                  <span style={{ color: '#0d1b3d' }}>{progress.toFixed(0)}%</span>
                </div>
                <div style={{ height: '10px', width: '100%', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      borderRadius: '10px',
                      background: card.gradient,
                      width: `${progress}%`,
                      transition: 'width 1s ease-out',
                    }}
                  />
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
