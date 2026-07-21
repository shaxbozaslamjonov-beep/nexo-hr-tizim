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
    <div className="p-4 sm:p-8 space-y-10 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* Polished Header & Toolbar Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t('analytics.title')}
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              {t('analytics.description')}
            </p>
          </div>
        </div>

        <div className="relative z-10 w-full lg:w-auto">
          <AnalyticsToolbar 
            onEditTimeRange={(range) => setTimeRange(range)}
            onEditPreferences={() => setIsEditModalOpen(true)} 
          />
        </div>
      </div>

      {/* Modern Insights Section - Elevated with wider gap */}
      <div className="transition-all duration-700 delay-200">
        <AnalyticsInsights data={insightsData} />
      </div>

      {/* Top row stats cards - Ultra Premium */}
      <div className="transition-all duration-700 delay-300">
        <StatsCards stats={stats} targets={preferences.targets} trends={trends} />
      </div>

      {/* Candidates Overview Table/Metrics */}
      <div className="transition-all duration-700 delay-400">
        <Card className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-2xl">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-500" />
              {t('metricsTitle') || "Nomzodlar statistikasi"}
            </h3>
          </div>
          <div className="p-0">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
              <div className="p-6 flex flex-col justify-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <p className="text-sm font-medium text-slate-500 mb-1">{t('analytics.stats.totalCandidates')}</p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-3xl font-black text-slate-900">{stats.candidates}</h4>
                  {trends.candidates != null && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${trends.candidates >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                      {trends.candidates >= 0 ? '+' : ''}{trends.candidates}%
                    </span>
                  )}
                </div>
              </div>
              <div className="p-6 flex flex-col justify-center bg-white hover:bg-slate-50 transition-colors">
                <p className="text-sm font-medium text-slate-500 mb-1">{t('analytics.stats.avgTime')}</p>
                <div className="flex items-baseline gap-2">
                  {extra.avgDaysToFill != null ? (
                    <h4 className="text-3xl font-black text-slate-900">{extra.avgDaysToFill}<span className="text-lg text-slate-400 font-semibold ml-1">{t('analytics.stats.days')}</span></h4>
                  ) : (
                    <h4 className="text-lg font-semibold text-slate-400">{t('analytics.stats.noData')}</h4>
                  )}
                </div>
              </div>
              <div className="p-6 flex flex-col justify-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <p className="text-sm font-medium text-slate-500 mb-1">{t('analytics.stats.offerAcceptance')}</p>
                <div className="flex items-baseline gap-2">
                  {extra.offerAcceptanceRate != null ? (
                    <h4 className="text-3xl font-black text-slate-900">{extra.offerAcceptanceRate}%</h4>
                  ) : (
                    <h4 className="text-lg font-semibold text-slate-400">{t('analytics.stats.noData')}</h4>
                  )}
                </div>
              </div>
              <div className="p-6 flex flex-col justify-center bg-white hover:bg-slate-50 transition-colors">
                <p className="text-sm font-medium text-slate-500 mb-1">{t('analytics.stats.positionsFilled')}</p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-3xl font-black text-slate-900">{extra.positionsFilled}<span className="text-lg text-slate-400 font-semibold ml-1">/{extra.positionsTotal}</span></h4>
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
