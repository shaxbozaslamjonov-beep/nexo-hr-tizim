'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  Search, 
  Plus, 
  Users, 
  Calendar, 
  Eye, 
  MapPin,
  MoreVertical,
  Share2,
  TrendingUp,
  Clock,
  ExternalLink,
  Edit,
  Trash2,
  Filter
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { can } from '@/lib/rbac';
import { vacancyService } from '@/lib/services/vacancyService';
import { Vacancy } from '@/types';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import styles from './vacancies_premium.module.css';

export default function VacanciesPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [filteredVacancies, setFilteredVacancies] = useState<Vacancy[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVacancies();
  }, []);

  const loadVacancies = async () => {
    setLoading(true);
    try {
      const data = await vacancyService.getVacancies();
      setVacancies(data);
      applyFilters(data, activeFilter, searchQuery);
    } catch (error) {
      toast.error(t('vacancies.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (data: Vacancy[], filter: string, search: string) => {
    let result = [...data];
    
    if (filter !== 'ALL') {
      result = result.filter(v => v.status === filter);
    }
    
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(v => 
        (v.title || '').toLowerCase().includes(q) || 
        (v.department || '').toLowerCase().includes(q) ||
        (v.location || '').toLowerCase().includes(q)
      );
    }
    
    setFilteredVacancies(result);
  };

  const handleFilter = (status: string) => {
    setActiveFilter(status);
    applyFilters(vacancies, status, searchQuery);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    applyFilters(vacancies, activeFilter, q);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('vacancies.confirmDelete'))) {
      const success = await vacancyService.deleteVacancy(id);
      if (success) {
        toast.success(t('vacancies.deleted'));
        loadVacancies();
      }
    }
  };

  const isAdmin = can(user, 'manage_vacancies');

  return (
    <div className="animate-fade-in" style={{ padding: '0 1rem' }}>
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.headerArea}
      >
        <div className={styles.headerBg} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.2)', borderRadius: '10px' }}>
              <TrendingUp size={20} color="white" />
            </div>
            <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.7rem' }}>
              Talent Acquisition
            </span>
          </div>
          <h1 className={styles.title}>{t('vacancies.title')}</h1>
          <p className={styles.subtitle}>Manage job openings and find the best talent</p>
        </div>
        
        {isAdmin && (
          <Link href="/dashboard/hr/vacancies/create" style={{ textDecoration: 'none' }}>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={styles.addBtn}
            >
              <Plus size={20} />
              {t('vacancies.createNew')}
            </motion.button>
          </Link>
        )}
      </motion.div>

      {/* Filters & Search Row */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['ALL', 'OPEN', 'PENDING', 'PENDING_APPROVAL', 'CLOSED'].map((status) => (
            <button
              key={status}
              onClick={() => handleFilter(status)}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '12px',
                border: 'none',
                background: activeFilter === status ? 'var(--primary)' : 'white',
                color: activeFilter === status ? 'white' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: activeFilter === status ? '0 4px 12px rgba(99, 102, 241, 0.3)' : '0 2px 4px rgba(0,0,0,0.05)',
              }}
            >
              {t(`vacancies.status.${status}`)}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: '300px' }}>
          <Search 
            size={18} 
            style={{ 
              position: 'absolute', 
              left: '1rem', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: 'var(--text-light)' 
            }} 
          />
          <input 
            type="text" 
            placeholder={t('searchByName')}
            value={searchQuery}
            onChange={handleSearch}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.75rem',
              borderRadius: '14px',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              fontSize: '0.9rem',
              fontWeight: 500,
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              outline: 'none',
              transition: 'all 0.2s',
            }}
          />
        </div>
      </div>

      {/* Vacancies Grid */}
      <div className={styles.grid}>
        {loading ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: 'var(--text-light)' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
              <TrendingUp size={48} />
            </motion.div>
            <p style={{ marginTop: '1rem' }}>{t('loading')}</p>
          </div>
        ) : filteredVacancies.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', background: 'var(--surface)', borderRadius: '24px', border: '1px dashed var(--border)' }}>
            <div style={{ marginBottom: '1rem', opacity: 0.3 }}>
              <Briefcase size={64} />
            </div>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{t('vacancies.noData')}</h3>
            {isAdmin && (
              <Link href="/dashboard/hr/vacancies/create" className="text-primary" style={{ fontWeight: 600 }}>
                {t('vacancies.createFirst')}
              </Link>
            )}
          </div>
        ) : (
          <AnimatePresence>
            {filteredVacancies.map((v, index) => (
              <motion.div 
                key={v.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className={styles.card}
              >
                <div className={styles.cardBg} />
                <div className={styles.cardTop}>
                  <div className={styles.iconBox}>
                    <Briefcase size={24} />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className={`badge badge-${v.status.toLowerCase()}`}>
                      {t(`vacancies.status.${v.status}`)}
                    </span>
                    {isAdmin && (
                      <div className="relative group" style={{ position: 'relative' }}>
                        <button className={styles.secondaryAction} style={{ width: '32px', height: '32px', border: 'none', background: 'transparent' }}>
                          <MoreVertical size={20} />
                        </button>
                        <div className="dropdown-menu" style={{
                           position: 'absolute',
                           top: '100%',
                           right: 0,
                           background: 'var(--surface)',
                           borderRadius: '12px',
                           boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                           border: '1px solid var(--border)',
                           zIndex: 10,
                           display: 'none',
                           minWidth: '150px',
                           padding: '0.5rem'
                        }}>
                          <Link href={`/dashboard/hr/vacancies/${v.id}/edit`} style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.75rem', 
                            padding: '0.75rem',
                            borderRadius: '8px',
                            color: 'var(--text-primary)',
                            fontSize: '0.85rem'
                          }} className="hover:bg-slate-50">
                            <Edit size={16} /> {t('edit')}
                          </Link>
                          <button onClick={() => handleDelete(v.id)} style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.75rem', 
                            padding: '0.75rem',
                            borderRadius: '8px',
                            color: '#ef4444',
                            fontSize: '0.85rem',
                            width: '100%',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }} className="hover:bg-red-50">
                            <Trash2 size={16} /> {t('deleteCandidate') || 'Delete'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <h3 className={styles.vacancyTitle}>{v.title}</h3>
                  <div className={styles.metadata}>
                    <div className={styles.metaItem}><MapPin size={14} />{v.location}</div>
                    <div className={styles.metaItem}>• {v.department}</div>
                    {(v as any).positionRef?.title && (
                      <div className={styles.metaItem} style={{ color: 'var(--primary)', fontWeight: 700 }}>• {(v as any).positionRef.title}</div>
                    )}
                  </div>
                </div>

                <div className={styles.statsRow}>
                  <div className={styles.appsCount}>
                    <Users size={18} color="var(--primary)" />
                    <div>
                      <span className={styles.countNum}>{v.candidatesCount}</span>
                      <span className={styles.countLabel}> {t('vacancies.candidates')}</span>
                    </div>
                  </div>
                  <div className={styles.postedAt}>
                    <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
                    {new Date(v.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className={styles.actions}>
                  <Link href={`/dashboard/hr/vacancies/${v.id}/applications`} style={{ textDecoration: 'none' }}>
                    <button className={styles.primaryAction} style={{ width: '100%' }}>
                      {t('vacancies.viewApplications')}
                    </button>
                  </Link>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link href={`/dashboard/hr/vacancies/${v.id}`}>
                      <button className={styles.secondaryAction} title="Preview">
                        <Eye size={20} />
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <style jsx>{`
        .group:hover .dropdown-menu {
          display: block !important;
        }
        .hover\:bg-slate-50:hover { background-color: #f8fafc; }
        .hover\:bg-red-50:hover { background-color: #fef2f2; }
      `}</style>
    </div>
  );
}
