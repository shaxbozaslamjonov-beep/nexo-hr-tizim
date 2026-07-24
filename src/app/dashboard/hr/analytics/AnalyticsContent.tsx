'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  Legend
} from 'recharts';
import { Download, Pencil, ArrowRight, Calendar, Filter, Sparkles, ChevronDown, Users } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { StatsCards } from '@/components/analytics/StatsCards';
import { RecruitmentFunnelChart } from '@/components/analytics/RecruitmentFunnelChart';
import { EmployeeDynamicsChart } from '@/components/analytics/EmployeeDynamicsChart';
import { AnalyticsEditModal, AnalyticsPreferences } from '@/components/analytics/AnalyticsEditModal';
import { AnalyticsInsights } from '@/components/analytics/AnalyticsInsights';
import { CandidateSkillsChart } from '@/components/analytics/CandidateSkillsChart';
import { VacancyStatusChart } from '@/components/analytics/VacancyStatusChart';
import { AnalyticsToolbar } from '@/components/analytics/AnalyticsToolbar';

import dashStyles from '../dashboard.module.css';

const DEFAULT_PREFERENCES: AnalyticsPreferences = {
  targets: {
    candidatesTarget: 150,
    vacanciesTarget: 12,
    lessonsTarget: 60,
    testResultsTarget: 200,
  }
};

const EMPTY_EXTRA = { avgDaysToFill: null, offerAcceptanceRate: null, positionsFilled: 0, positionsTotal: 0 };

export function AnalyticsContent() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({ candidates: 0, vacancies: 0, lessons: 0, testResults: 0 });
  const [trends, setTrends] = useState<{ candidates?: number | null; vacancies?: number | null }>({});
  const [extra, setExtra] = useState<typeof EMPTY_EXTRA>(EMPTY_EXTRA);
  const [funnelData, setFunnelData] = useState<{ name: string; value: number }[]>([]);
  const [dynamicsData, setDynamicsData] = useState([]);
  const [vacancyStatusData, setVacancyStatusData] = useState([
    { name: 'Open', value: 0 },
    { name: 'Pending', value: 0 },
    { name: 'Closed', value: 0 },
  ]);
  const [skillsData, setSkillsData] = useState<any>(null);
  const [insightsData, setInsightsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [preferences, setPreferences] = useState<AnalyticsPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    // Load preferences from localStorage
    const saved = localStorage.getItem('hr_analytics_preferences');
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved preferences', e);
      }
    }

    const fetchData = async () => {
      try {
        const [statsRes, funnelRes, dynamicsRes, vacStatusRes, insightsRes, skillsRes] = await Promise.all([
          fetch(`/api/analytics/stats?range=${timeRange}`),
          fetch('/api/analytics/recruitment-funnel'),
          fetch('/api/analytics/employee-dynamics'),
          fetch('/api/analytics/vacancy-status'),
          fetch(`/api/analytics/insights?range=${timeRange}`),
          fetch('/api/analytics/candidate-skills'),
        ]);

        if (statsRes.ok) {
           const s = await statsRes.json();
           if (s && s.candidates !== undefined) {
             setStats(s);
             setTrends(s.trends || {});
             setExtra(s.extra || EMPTY_EXTRA);
           }
        }
        if (funnelRes.ok) {
           const f = await funnelRes.json();
           if (Array.isArray(f)) setFunnelData(f);
        }
        if (dynamicsRes.ok) {
           const d = await dynamicsRes.json();
           if (d) setDynamicsData(d);
        }
        if (vacStatusRes.ok) {
           const v = await vacStatusRes.json();
           if (v && v.length > 0) setVacancyStatusData(v);
        }
        if (insightsRes.ok) {
           const i = await insightsRes.json();
           if (i) setInsightsData(i);
        }
        if (skillsRes.ok) {
           const sk = await skillsRes.json();
           if (sk) setSkillsData(sk);
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [timeRange]);

  const handleSavePreferences = (newPrefs: AnalyticsPreferences) => {
    setPreferences(newPrefs);
    localStorage.setItem('hr_analytics_preferences', JSON.stringify(newPrefs));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 min-h-[600px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1600px', margin: '0 auto' }}>

      {/* Deep Navy Hero Banner with Premium Glass Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0d1b3d 0%, #1f3480 50%, #2e4ba8 100%)',
        padding: '2.25rem 2.75rem',
        borderRadius: '24px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 40px -15px rgba(13, 27, 61, 0.35)',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
      }}>
        {/* Glow accent */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '400px',
          height: '400px',
          background: 'rgba(65, 105, 201, 0.25)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }} />

        {/* Title & Description */}
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '650px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            fontSize: '0.7rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#93c5fd',
            marginBottom: '0.75rem',
          }}>
            <Sparkles size={14} color="#fbbf24" />
            ANALYTICS ENGINE V2.0
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '0.5rem', lineHeight: 1.2 }}>
            {t('analytics.title') || 'Аналитика найма'}
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.5, margin: 0 }}>
            {t('analytics.description') || 'Отслеживайте воронку рекрутинга, вакансии и динамику команды в реальном времени.'}
          </p>
        </div>

        {/* Right Toolbar */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <AnalyticsToolbar 
            onEditTimeRange={(range) => setTimeRange(range)}
            onEditPreferences={() => setIsEditModalOpen(true)} 
            stats={stats}
          />
        </div>
      </div>


      {/* Modern Insights Section */}
      <div>
        <AnalyticsInsights data={insightsData} />
      </div>


      {/* Top row stats cards */}
      <div>
        <StatsCards stats={stats} targets={preferences.targets} trends={trends} />
      </div>

      {/* Candidates Overview Table/Metrics */}
      <div>
        <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0d1b3d', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
              <div style={{ padding: '0.5rem', background: '#eff6ff', borderRadius: '12px', color: '#2563eb', display: 'flex' }}>
                <Users size={20} />
              </div>
              {t('metricsTitle') || "Nomzodlar statistikasi"}
            </h3>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Jonli ma'lumotlar</span>
          </div>

          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              {/* Stat 1: Total Candidates */}
              <div style={{ padding: '1.25rem', borderRadius: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                  {t('analytics.stats.totalCandidates') || 'Всего кандидатов'}
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', width: '100%' }}>
                  <h4 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0d1b3d', margin: 0, lineHeight: 1 }}>
                    {stats.candidates}
                  </h4>
                  {trends.candidates != null && (
                    <span style={{ padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, background: trends.candidates >= 0 ? '#dcfce7' : '#fee2e2', color: trends.candidates >= 0 ? '#15803d' : '#b91c1c' }}>
                      {trends.candidates >= 0 ? '+' : ''}{trends.candidates}%
                    </span>
                  )}
                </div>
              </div>

              {/* Stat 2: Avg Time to Fill */}
              <div style={{ padding: '1.25rem', borderRadius: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                  {t('analytics.stats.avgTime') || 'Среднее время закрытия'}
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', width: '100%' }}>
                  {extra.avgDaysToFill != null ? (
                    <h4 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0d1b3d', margin: 0, lineHeight: 1 }}>
                      {extra.avgDaysToFill} <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 700 }}>{t('analytics.stats.days') || 'дней'}</span>
                    </h4>
                  ) : (
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>
                      {t('analytics.stats.noData') || 'Нет данных'}
                    </h4>
                  )}
                </div>
              </div>

              {/* Stat 3: Offer Acceptance Rate */}
              <div style={{ padding: '1.25rem', borderRadius: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                  {t('analytics.stats.offerAcceptance') || 'Принятие офферов'}
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', width: '100%' }}>
                  {extra.offerAcceptanceRate != null ? (
                    <h4 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0d1b3d', margin: 0, lineHeight: 1 }}>
                      {extra.offerAcceptanceRate}%
                    </h4>
                  ) : (
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>
                      {t('analytics.stats.noData') || 'Нет данных'}
                    </h4>
                  )}
                </div>
              </div>

              {/* Stat 4: Positions Filled */}
              <div style={{ padding: '1.25rem', borderRadius: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                  {t('analytics.stats.positionsFilled') || 'Закрытые позиции'}
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', width: '100%' }}>
                  <h4 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0d1b3d', margin: 0, lineHeight: 1 }}>
                    {extra.positionsFilled} <span style={{ fontSize: '1.1rem', color: '#94a3b8', fontWeight: 700 }}>/{extra.positionsTotal}</span>
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Row 1: Funnel + Skills */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
          <div style={{ gridColumn: 'span 2 / span 2' }}>
            <RecruitmentFunnelChart data={funnelData} />
          </div>
          <div>
            <CandidateSkillsChart data={skillsData} />
          </div>
        </div>

        {/* Row 2: Vacancy Status + Dynamics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
          <div>
            <VacancyStatusChart data={vacancyStatusData} />
          </div>
          <div style={{ gridColumn: 'span 2 / span 2' }}>
            <EmployeeDynamicsChart data={dynamicsData} />
          </div>
        </div>
      </div>

      {/* Decorative footer element */}
      <div style={{
        paddingTop: '2.5rem',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.75rem',
        fontWeight: 800,
        letterSpacing: '0.15em',
        color: '#94a3b8',
        textTransform: 'uppercase'
      }}>
        <span>Nexo HR Analytics Engine v2.0</span>
        <span>© 2026 Nexo Platform</span>
      </div>

      {/* Edit Preferences Modal */}
      <AnalyticsEditModal 
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        currentPreferences={preferences}
        onSave={handleSavePreferences}
      />
    </div>
  );
}
