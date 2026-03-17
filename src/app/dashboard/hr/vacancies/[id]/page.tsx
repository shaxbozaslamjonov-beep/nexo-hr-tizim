'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { vacancyService } from '@/lib/services/vacancyService';
import { interviewService } from '@/lib/services/interviewService';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Vacancy, Interview } from '@/types';
import { ArrowLeft, Briefcase, MapPin, DollarSign, Calendar, Users, Edit, Trash2, Mic2, Clock, Video, Phone, ChevronRight, Activity, Eye, FileText } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { toast } from 'react-hot-toast';

export default function VacancyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useLanguage();
  const router = useRouter();
  const { user } = useAuth();
  const [vacancy, setVacancy] = useState<Vacancy | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [v, intvs] = await Promise.all([
          vacancyService.getVacancyById(id),
          interviewService.getInterviews()
        ]);
        
        if (v) {
          setVacancy(v);
          setInterviews(intvs.filter(i => i.vacancyTitle === v.title));
        }
      } catch (error) {
        console.error('Error fetching vacancy data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (confirm(t('vacancies.confirmDelete'))) {
      try {
        const success = await vacancyService.deleteVacancy(id);
        if (success) {
          toast.success(t('vacancies.deleted'));
          router.push('/dashboard/hr/vacancies');
        }
      } catch (error) {
        toast.error('Failed to delete vacancy');
      }
    }
  };

  const loadAnalytics = async () => {
    if (analyticsData) {
      setShowAnalytics(!showAnalytics);
      return;
    }
    setLoadingAnalytics(true);
    setShowAnalytics(true);
    try {
      const res = await fetch(`/api/vacancies/${id}/analytics`);
      if (res.ok) {
        setAnalyticsData(await res.json());
      }
    } catch (error) {
      toast.error('Failed to load analytics');
      setShowAnalytics(false);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';

  if (loading) return <div style={{ padding: '2rem' }}>{t('loading')}</div>;
  if (!vacancy) return <div style={{ padding: '2rem' }}>Vacancy not found</div>;

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <Link
          href="/dashboard/hr/vacancies"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            color: 'var(--text-secondary)', 
            fontWeight: 600
          }}
          className="hover-lift"
        >
          <ArrowLeft size={20} />
          {t('backToCandidates') || 'Back'}
        </Link>

        {isAdmin && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={loadAnalytics} style={{ 
              padding: '0.6rem 1.25rem', 
              borderRadius: '12px', 
              border: '1px solid var(--border)', 
              background: '#f0f9ff',
              color: '#0ea5e9',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer'
            }} className="hover-lift">
              <Activity size={18} /> Analiz
            </button>
            <Link href={`/dashboard/hr/vacancies/${id}/edit`}>
              <button style={{ 
                padding: '0.6rem 1.25rem', 
                borderRadius: '12px', 
                border: '1px solid var(--border)', 
                background: 'white',
                color: 'var(--text-primary)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer'
              }} className="hover-lift">
                <Edit size={18} /> {t('edit')}
              </button>
            </Link>
            <button onClick={handleDelete} style={{ 
              padding: '0.6rem 1.25rem', 
              borderRadius: '12px', 
              border: 'none', 
              background: '#fee2e2',
              color: '#ef4444',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer'
            }} className="hover-lift">
              <Trash2 size={18} /> {t('deleteCandidate') || 'Delete'}
            </button>
          </div>
        )}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid var(--border)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              {vacancy.title}
            </h1>
            <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Briefcase size={18} /> {vacancy.department}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={18} /> {vacancy.location}</span>
              {vacancy.salary && <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><DollarSign size={18} /> {vacancy.salary}</span>}
            </div>
          </div>
          <span className={`badge badge-${vacancy.status.toLowerCase()}`} style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>
            {t(`vacancies.status.${vacancy.status}`)}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '3rem', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '1.5rem 0', marginBottom: '2.5rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Created At</p>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}><Calendar size={16} style={{ display: 'inline', marginRight: '6px' }} /> {new Date(vacancy.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Applicants</p>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}><Users size={16} style={{ display: 'inline', marginRight: '6px' }} /> {vacancy.candidatesCount} Candidates</p>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '2.5rem' }}>
          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>Job Description</h2>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {vacancy.description}
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>Requirements</h2>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {vacancy.requirements}
            </div>
          </section>

          <section style={{ borderTop: '1px solid var(--border)', paddingTop: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                <Mic2 size={24} style={{ verticalAlign: 'middle', marginRight: '0.75rem' }} />
                Related Interviews
              </h2>
              <span className="badge" style={{ fontSize: '0.75rem' }}>{interviews.length} Scheduled</span>
            </div>

            {interviews.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', color: '#94a3b8' }}>
                No interviews scheduled for this vacancy yet
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {interviews.map(i => (
                  <div key={i.id} style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid transparent', transition: 'all 0.2s', cursor: 'pointer' }} onClick={() => router.push(`/dashboard/hr/interviews/${i.id}`)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontWeight: 800 }}>{i.candidateName}</span>
                      <span className={`badge badge-${i.status.toLowerCase()}`}>{i.status}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={14} /> {new Date(i.scheduledDate).toLocaleDateString()}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={14} /> {new Date(i.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {i.type === 'online' ? <Video size={14} /> : i.type === 'phone' ? <Phone size={14} /> : <MapPin size={14} />}
                        {i.location || i.type}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <AnimatePresence>
            {showAnalytics && (
              <motion.section 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden', borderTop: '1px solid var(--border)', paddingTop: '2.5rem' }}
              >
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Activity size={24} color="#0ea5e9" />
                  Chuqurlashtirilgan Analiz
                </h2>
                
                {loadingAnalytics ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>
                ) : analyticsData && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                      <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #e2e8f0' }}>
                        <Eye size={24} color="#6366f1" style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>{analyticsData.views}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Ko'rishlar</div>
                      </div>
                      <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #e2e8f0' }}>
                        <FileText size={24} color="#10b981" style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>{analyticsData.applicationsCount}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Arizalar</div>
                      </div>
                      <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #e2e8f0' }}>
                        <Clock size={24} color="#f59e0b" style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>{analyticsData.avgTimeToFill} Kun</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>O'rtacha vaqt</div>
                      </div>
                    </div>

                    <div style={{ background: 'white', border: '1px solid #e2e8f0', padding: '2rem', borderRadius: '16px', height: '350px' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem' }}>Nomzodlar Funnel Diagrammasi</h3>
                      <ResponsiveContainer width="100%" height="80%">
                        <BarChart data={analyticsData.funnelData} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                          <XAxis type="number" axisLine={false} tickLine={false} />
                          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontWeight={600} />
                          <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32}>
                            {analyticsData.funnelData.map((d: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6'][index % 5]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
          <Link href={`/dashboard/hr/vacancies/${id}/applications`}>
            <button style={{ 
              padding: '1rem 3rem', 
              borderRadius: '16px', 
              border: 'none', 
              background: 'var(--grad-primary)', 
              color: 'white', 
              fontWeight: 800, 
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)'
            }} className="hover-lift">
              {t('vacancies.viewApplications')}
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
