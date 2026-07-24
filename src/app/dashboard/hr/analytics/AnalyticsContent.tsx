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
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      
      {/* Deep Navy Hero Banner matching HR Dashboard */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#0d1b3d] via-[#1f3480] to-[#2e4ba8] p-8 lg:p-10 text-white shadow-xl">
        <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-black uppercase tracking-widest text-blue-200">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              ANALYTICS ENGINE V2.0
            </div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white">
              {t('analytics.title') || 'Аналитика найма'}
            </h1>
            <p className="text-sm lg:text-base text-blue-100/80 font-medium max-w-2xl">
              {t('analytics.description') || 'Отслеживайте воронку рекрутинга, вакансии и динамику команды в реальном времени.'}
            </p>
          </div>

          <div className="relative z-10 w-full lg:w-auto bg-white/10 backdrop-blur-xl p-2 rounded-2xl border border-white/20">
            <AnalyticsToolbar 
              onEditTimeRange={(range) => setTimeRange(range)}
              onEditPreferences={() => setIsEditModalOpen(true)} 
            />
          </div>
        </div>
      </div>

      {/* Modern Insights Section - Elevated */}
      <div className="transition-all duration-700 delay-200">
        <AnalyticsInsights data={insightsData} />
      </div>


      {/* Top row stats cards - Ultra Premium */}
      <div className="transition-all duration-700 delay-300">
        <StatsCards stats={stats} targets={preferences.targets} trends={trends} />
      </div>

      {/* Candidates Overview Table/Metrics - Fixed spacing & rich cards */}
      <div className="transition-all duration-700 delay-400">
        <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0d1b3d', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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



      {/* Main Charts Grid - Rich Hierarchy */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

        {/* Recruitment Funnel - Strong visual weight */}
        <div className="lg:col-span-2 group">
          <RecruitmentFunnelChart data={funnelData} />
        </div>

        {/* Candidate skills breakdown - real data */}
        <div className="transition-transform hover:scale-[1.02] duration-500">
          <CandidateSkillsChart data={skillsData} />
        </div>

        {/* Vacancies Pie Chart - Refactored to separate component */}
        <div className="transition-transform hover:scale-[1.02] duration-500 transform-gpu">
          <VacancyStatusChart data={vacancyStatusData} />
        </div>

        {/* Employee Dynamics - Full width for deep analysis */}
        <div className="md:col-span-2 lg:col-span-3">
          <EmployeeDynamicsChart data={dynamicsData} />
        </div>
      </div>

      {/* Decorative footer element for finish */}
      <div className="pt-10 border-t border-slate-100 flex justify-between items-center text-[10px] font-black tracking-[0.3em] text-slate-300 uppercase">
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
