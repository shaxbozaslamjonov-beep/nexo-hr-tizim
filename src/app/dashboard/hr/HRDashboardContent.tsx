'use client';

import { useEffect, useState } from 'react';
import { 
  Users, 
  ClipboardList, 
  Briefcase, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Search,
  PlusCircle,
  MoreHorizontal,
  ArrowUpRight,
  Zap,
  Mic2,
  FolderHeart
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  AreaChart,
  Area,
  PieChart,
  Pie
} from 'recharts';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { candidateService } from '@/lib/services/candidateService';
import { employeeService } from '@/lib/services/employeeService';
import { vacancyService } from '@/lib/services/vacancyService';
import { applicationService } from '@/lib/services/applicationService';
import { interviewService } from '@/lib/services/interviewService';
import { reserveService } from '@/lib/services/reserveService';
import { trainingService } from '@/lib/services/trainingService';
import { testService } from '@/lib/services/testService';
import { Candidate, EmployeeProfile, User, Vacancy, Application, Interview, ReserveCandidate, TrainingPath, TestResult } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';

// Reusing StatCard component...
function StatCard({
  title,
  value,
  icon: Icon,
  change,
  changeType,
  colorClass,
  delay = 0
}: {
  title: string;
  value: string | number;
  icon: any;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  colorClass: string;
  delay?: number;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={styles.card}
    >
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>{title}</span>
        <div className={`${styles.cardIcon} ${styles[colorClass]}`}>
          <Icon size={24} />
        </div>
      </div>
      <div className={styles.cardContent}>
        <div className={styles.cardValue}>{value}</div>
        <div className={styles.cardFooter}>
          {change && (
            <div className={`${styles.cardChange} ${styles[`change${changeType?.charAt(0).toUpperCase()}${changeType?.slice(1)}`]}`}>
              {changeType === 'positive' && <ArrowUpRight size={12} style={{ marginRight: 4 }} />}
              {change}
            </div>
          )}
          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>vs last month</span>
        </div>
      </div>
    </motion.div>
  );
}

export function HRDashboardContent() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [probationEmployees, setProbationEmployees] = useState<(EmployeeProfile & { user: User })[]>([]);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [todayInterviews, setTodayInterviews] = useState<Interview[]>([]);
  const [interviewStats, setInterviewStats] = useState<{ name: string, value: number, color: string }[]>([]);
  const [reserveCount, setReserveCount] = useState(0);
  const [trainingPaths, setTrainingPaths] = useState<TrainingPath[]>([]);
  const [testResults, setTestResults] = useState<{name:string, testId:string, score:number, status:string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const recentCands = await candidateService.getLatestCandidates(5);
        const endingProbation = await employeeService.getProbationEndingSoon(5);

        setCandidates(recentCands);
        setProbationEmployees(endingProbation);
        
        const [allVacancies, allApplications, allInterviews, allTestResults, allPaths] = await Promise.all([
          vacancyService.getVacancies(),
          applicationService.getApplications(),
          interviewService.getInterviews(),
          testService.getAllTestResults(),
          trainingService.getAllPaths()
        ]);

        setVacancies(allVacancies.slice(0, 4));
        setApplications(allApplications);
        setTrainingPaths(allPaths.slice(0, 2));

        const mappedTestResults = allTestResults.slice(0, 5).map((r, i) => ({
          name: ['John Doe', 'Sarah Wilson', 'Mike Ross', 'Harvey Specter', 'Louis Litt'][i % 5],
          testId: r.testId,
          score: r.score,
          status: r.status
        }));
        setTestResults(mappedTestResults);
        
        const today = new Date().toDateString();
        const tInterviews = allInterviews.filter(i => 
          new Date(i.scheduledDate).toDateString() === today && i.status === 'scheduled'
        );
        setTodayInterviews(tInterviews);
        setInterviews(allInterviews);

        const passed = allInterviews.filter(i => i.result === 'passed').length;
        const failed = allInterviews.filter(i => i.result === 'failed').length;
        const pending = allInterviews.filter(i => i.result === 'pending' || (i.status === 'completed' && !i.result)).length;
        
        setInterviewStats([
          { name: (t('interviews.result.passed') as string) || 'Passed', value: passed, color: '#10b981' },
          { name: (t('interviews.result.failed') as string) || 'Failed', value: failed, color: '#ef4444' },
          { name: (t('interviews.result.pending') as string) || 'Pending', value: pending, color: '#f59e0b' }
        ]);

        const resList = await reserveService.getReserveList();
        setReserveCount(resList.filter((r: ReserveCandidate) => r.status === 'active').length);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [t]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 18) return t('goodDay');
    return t('goodEvening');
  };

  const funnelData = [
    { name: (t('funnel.stages.applications') as string) || 'Arizalar', value: applications.length, color: '#6366f1' },
    { name: (t('funnel.stages.screening') as string) || 'Screening', value: candidates.filter(c => c.status === 'SCREENING').length, color: '#4f46e5' },
    { name: (t('funnel.stages.interviews') as string) || 'Suhbatlar', value: interviews.length, color: '#8b5cf6' },
    { name: (t('funnel.stages.training') as string) || 'Trening', value: trainingPaths.reduce((acc, obj) => acc + (obj.assignedTo?.length || 0), 0), color: '#f97316' },
    { name: (t('funnel.stages.hired') as string) || 'Ishga qabul qilingan', value: candidates.filter(c => c.status === 'HIRED').length, color: '#10b981' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Premium Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={styles.welcomeSection}
      >
        <div className={styles.welcomeBg} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.2)', borderRadius: '10px' }}>
              <Zap size={24} fill="white" />
            </div>
            <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem' }}>
              System Overview
            </span>
          </div>
          <h1 className={styles.welcomeTitle}>
            {getGreeting()}, Admin!
          </h1>
          <p className={styles.welcomeText}>
            Welcome back to Nexo HR. You have {applications.filter(a => a.status === 'new').length} new vacancy applications and {interviews.length} interviews today.
          </p>
        </div>
      </motion.div>

      {/* Stats overview */}
      <div className={styles.statsGrid}>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${styles.card} styles.probationCard`}
          style={{ background: 'var(--grad-sidebar)', color: 'white' }}
        >
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle} style={{ color: 'rgba(255,255,255,0.7)' }}>{t('probation')}</span>
            <Clock size={24} />
          </div>
          <div className={styles.cardContent}>
            <div className={styles.cardValue} style={{ color: 'white' }}>{probationEmployees.length}</div>
            <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>Ending soon</p>
            <div className={styles.probationAvatars}>
              {probationEmployees.map((pe, i) => (
                <div 
                  key={pe.id} 
                  className={styles.probationAvatar} 
                  style={{ background: `hsla(${i * 40}, 70%, 60%, 1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold', color: 'white' }}
                >
                  {pe.user.firstName[0]}{pe.user.lastName[0]}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <StatCard
          title={t('applications.title')}
          value={applications.length}
          icon={ClipboardList}
          change={`+${applications.filter(a => a.status === 'new').length}`}
          changeType="positive"
          colorClass="primary"
          delay={0.1}
        />
        <StatCard
          title={t('interviews.title')}
          value={interviews.length}
          icon={Mic2}
          change={`${interviews.length} today`}
          changeType="neutral"
          colorClass="accent"
          delay={0.2}
        />
        <StatCard
          title={t('reserve.title')}
          value={reserveCount}
          icon={FolderHeart}
          change="Available"
          changeType="neutral"
          colorClass="success"
          delay={0.3}
        />
      </div>

      {/* Main Content Grid */}
      <div className={styles.grid2}>
         {/* Today's Interviews */}
         <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={styles.section}
        >
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
               <Mic2 size={24} style={{ verticalAlign: 'middle', marginRight: '0.75rem' }} />
               {t('interviews.title')} (Today)
            </h2>
            <Link href="/dashboard/hr/interviews" className="badge" style={{ textDecoration: 'none' }}>
              View Calendar
            </Link>
          </div>
          
          {todayInterviews.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
               No interviews scheduled for today
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {todayInterviews.map(i => (
                <Link key={i.id} href={`/dashboard/hr/interviews/${i.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className={styles.interviewListItem}>
                     <div className={styles.miniAvatar}>{i.candidateName?.[0]}</div>
                     <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700 }}>{i.candidateName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{i.vacancyTitle}</div>
                     </div>
                     <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: 'var(--primary)' }}>
                          {new Date(i.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', textTransform: 'capitalize' }}>
                           {i.type}
                        </div>
                     </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recruitment Funnel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={styles.section}
        >
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recruitment Funnel</h2>
          </div>
          <div className={styles.chartContainer} style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  width={100}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)' }}
                />
                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={30}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        {/* Interview Results Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={styles.section}
        >
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Interview Results</h2>
          </div>
          <div className={styles.chartContainer} style={{ height: '300px', display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="60%" height="100%">
              <PieChart>
                <Pie
                  data={interviewStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {interviewStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ width: '40%', paddingLeft: '1rem' }}>
               {interviewStats.map((s, i) => (
                 <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: s.color }} />
                    <div style={{ flex: 1, fontSize: '0.85rem', fontWeight: 600 }}>{s.name}</div>
                    <div style={{ fontWeight: 800 }}>{s.value}</div>
                 </div>
               ))}
            </div>
          </div>
        </motion.div>
      </div>

      <div className={styles.grid2}>
        {/* Recent Vacancies */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className={styles.section}
        >
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('recentVacancies')}</h2>
            <Link href="/dashboard/hr/vacancies" className="badge badge-passed" style={{ textDecoration: 'none' }}>
              Manage
            </Link>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('vacancies.title')}</th>
                <th>DEPT</th>
                <th>APPS</th>
              </tr>
            </thead>
            <tbody>
              {vacancies.map((v) => (
                <tr key={v.id}>
                  <td><span style={{ fontWeight: 700 }}>{v.title}</span></td>
                  <td><span style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>{v.department}</span></td>
                  <td><span style={{ fontWeight: 800 }}>{v.candidatesCount}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Recent Candidates */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className={styles.section}
        >
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('recentCandidates')}</h2>
          </div>
          {candidates.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
              {t('noCandidates')}
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('candidates.title')}</th>
                  <th>STATUS</th>
                  <th>STAGE</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => (
                  <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/dashboard/hr/candidates/${c.id}`)}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.miniAvatar}>{c.firstName[0]}{c.lastName[0]}</div>
                        <div>
                          <div style={{ fontWeight: 700 }}>{c.firstName} {c.lastName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{c.vacancyTitle}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${c.status.toLowerCase()}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{c.stage}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>
      </div>
      <div className={styles.grid2} style={{ marginTop: '2rem' }}>
        {/* Learning & Development */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={styles.section}
        >
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('training.title')}</h2>
            <Link href="/dashboard/hr/training" style={{ textDecoration: 'none', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>
              {t('viewAll') || 'Barchasini ko\'rish'}
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {trainingPaths.map(path => (
              <div key={path.id} style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', padding: '1.25rem', borderRadius: '20px', border: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => router.push(`/dashboard/hr/training/${path.id}`)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{path.title}</span>
                  <span style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '1.1rem' }}>
                     {/* Dynamic % if possible, mocked for UI standard */}
                     65%
                  </span>
                </div>
                <div style={{ height: '10px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '5px', overflow: 'hidden' }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: '65%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                    style={{ height: '100%', background: 'var(--grad-primary)', borderRadius: '5px' }} 
                  />
                </div>
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>
                  <span>{path.stages?.length || 0} stages</span>
                  <span>Assigned to {path.assignedTo?.length || 0}</span>
                </div>
              </div>
            ))}
            
            {trainingPaths.length === 0 && (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8' }}>
                No active training paths
              </div>
            )}
          </div>
        </motion.div>

        {/* Test Analytics */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={styles.section}
        >
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('tests.results')}</h2>
            <Link href="/dashboard/hr/tests" style={{ textDecoration: 'none', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>
              {t('viewAll') || 'Barchasini ko\'rish'}
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
             {testResults.length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8' }}>
                  No recent test results
                </div>
             ) : (
               testResults.map((res, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--background)', borderRadius: '16px', border: '1px solid transparent', transition: 'all 0.2s', cursor: 'pointer' }} onClick={() => router.push(`/dashboard/hr/tests/results?userId=${res.testId}`)}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>{res.name?.[0] || '?'}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{res.testId}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>{res.name}</div>
                        </div>
                     </div>
                     <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: res.status === 'passed' ? '#10b981' : '#ef4444' }}>{res.score}%</div>
                        <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 800, opacity: 0.6 }}>{res.status}</div>
                     </div>
                  </div>
               ))
             )}
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .${styles.interviewListItem} {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .${styles.interviewListItem}:hover {
          background: #f1f5f9;
          transform: translateX(5px);
        }
      `}</style>
    </div>
  );
}


