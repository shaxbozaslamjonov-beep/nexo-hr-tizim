'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { vacancyService } from '@/lib/services/vacancyService';
import { candidateService } from '@/lib/services/candidateService';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Vacancy, Candidate } from '@/types';
import { ArrowLeft, Users, Mail, Phone, Calendar, ChevronRight, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function VacancyApplicationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useLanguage();
  const [vacancy, setVacancy] = useState<Vacancy | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const v = await vacancyService.getVacancyById(id);
      if (v) {
        setVacancy(v);
        const c = await candidateService.getCandidatesByVacancy(id);
        setCandidates(c);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) return <div style={{ padding: '2rem' }}>{t('loading')}</div>;
  if (!vacancy) return <div style={{ padding: '2rem' }}>Vacancy not found</div>;

  return (
    <div className="animate-fade-in" style={{ padding: '2rem' }}>
      <Link
        href="/dashboard/hr/vacancies"
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          color: 'var(--text-secondary)', 
          marginBottom: '2rem',
          fontWeight: 600
        }}
        className="hover-lift"
      >
        <ArrowLeft size={20} />
        {t('backToCandidates') || 'Back'}
      </Link>

      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          {vacancy.title}
        </h1>
        <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Briefcase size={16} /> {vacancy.department} • {candidates.length} {t('vacancies.candidates')}
        </p>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {candidates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '24px', border: '1px dashed var(--border)' }}>
            <Users size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <h3 style={{ color: 'var(--text-secondary)' }}>{t('noCandidates')}</h3>
          </div>
        ) : (
          <AnimatePresence>
            {candidates.map((candidate, index) => (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s',
                }}
                className="hover-lift"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                   <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '12px', 
                      background: 'var(--primary)', 
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1.2rem'
                   }}>
                    {candidate.firstName[0]}{candidate.lastName[0]}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                      {candidate.firstName} {candidate.lastName}
                    </h3>
                    <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-light)', fontSize: '0.85rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Mail size={14} /> {candidate.email}</span>
                      {candidate.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Phone size={14} /> {candidate.phone}</span>}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge badge-${candidate.status.toLowerCase()}`} style={{ marginBottom: '0.25rem' }}>
                      {candidate.status}
                    </span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                      <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      {new Date(candidate.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Link href={`/dashboard/hr/candidates/${candidate.id}`}>
                    <button style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '10px', 
                      border: '1px solid var(--border)', 
                      background: 'white',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}>
                      <ChevronRight size={20} />
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
