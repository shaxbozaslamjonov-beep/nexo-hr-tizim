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
        <Card className="border border-slate-200/80 dark:border-slate-800 shadow-md overflow-hidden bg-white dark:bg-slate-900 rounded-3xl">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Users className="h-5 w-5" />
              </div>
              {t('metricsTitle') || "Nomzodlar statistikasi"}
            </h3>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Jonli ma'lumotlar</span>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stat 1: Total Candidates */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col justify-between space-y-4 hover:border-indigo-200 transition-all">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-relaxed">
                  {t('analytics.stats.totalCandidates') || 'Всего кандидатов'}
                </p>
                <div className="flex items-baseline justify-between gap-2 pt-2">
                  <h4 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                    {stats.candidates}
                  </h4>
                  {trends.candidates != null && (
                    <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 ${trends.candidates >= 0 ? 'text-emerald-700 bg-emerald-100/80 dark:bg-emerald-950 dark:text-emerald-400' : 'text-red-700 bg-red-100/80 dark:bg-red-950 dark:text-red-400'}`}>
                      {trends.candidates >= 0 ? '+' : ''}{trends.candidates}%
                    </span>
                  )}
                </div>
              </div>

              {/* Stat 2: Avg Time to Fill */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col justify-between space-y-4 hover:border-indigo-200 transition-all">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-relaxed">
                  {t('analytics.stats.avgTime') || 'Среднее время закрытия'}
                </p>
                <div className="flex items-baseline justify-between gap-2 pt-2">
                  {extra.avgDaysToFill != null ? (
                    <h4 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none flex items-baseline gap-1">
                      {extra.avgDaysToFill}
                      <span className="text-sm text-slate-400 font-bold">{t('analytics.stats.days') || 'дней'}</span>
                    </h4>
                  ) : (
                    <h4 className="text-base font-bold text-slate-400 italic">
                      {t('analytics.stats.noData') || 'Нет данных'}
                    </h4>
                  )}
                </div>
              </div>

              {/* Stat 3: Offer Acceptance Rate */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col justify-between space-y-4 hover:border-indigo-200 transition-all">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-relaxed">
                  {t('analytics.stats.offerAcceptance') || 'Принятие офферов'}
                </p>
                <div className="flex items-baseline justify-between gap-2 pt-2">
                  {extra.offerAcceptanceRate != null ? (
                    <h4 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                      {extra.offerAcceptanceRate}%
                    </h4>
                  ) : (
                    <h4 className="text-base font-bold text-slate-400 italic">
                      {t('analytics.stats.noData') || 'Нет данных'}
                    </h4>
                  )}
                </div>
              </div>

              {/* Stat 4: Positions Filled */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col justify-between space-y-4 hover:border-indigo-200 transition-all">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-relaxed">
                  {t('analytics.stats.positionsFilled') || 'Закрытые позиции'}
                </p>
                <div className="flex items-baseline justify-between gap-2 pt-2">
                  <h4 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none flex items-baseline">
                    {extra.positionsFilled}
                    <span className="text-xl text-slate-400 font-bold ml-1">/{extra.positionsTotal}</span>
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </Card>
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
