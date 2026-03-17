'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { trainingService } from '@/lib/services/trainingService';
import { TrainingPath } from '@/types';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Plus, 
  Search, 
  GraduationCap, 
  ArrowRight, 
  Clock, 
  Layers, 
  Users,
  MoreVertical,
  Trash2,
  Edit2,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import styles from './training.module.css';
import { TableSkeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';

export function TrainingTracksContent() {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const [paths, setPaths] = useState<TrainingPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPaths = async () => {
    setLoading(true);
    try {
      const data = await trainingService.getAllPaths();
      setPaths(data);
    } catch (e) {
      console.error('Failed to fetch training paths:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaths();
  }, []);

  const filteredPaths = paths.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm(t('confirmDelete') || 'Are you sure?')) {
      try {
        await trainingService.deletePath(id);
        setPaths(prev => prev.filter(p => p.id !== id));
        toast.success(t('deleted'));
      } catch (e) {
        toast.error('Delete failed');
      }
    }
  };

  return (
    <div className="animate-fade-in">
      <div className={styles.pageHeader}>
        <div className={styles.headerBg} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 className={styles.pageTitle}>{t('training.title')}</h1>
          <p className={styles.pageSubtitle}>{t('training.pathDescription')}</p>
        </div>
        {isAdmin && (
          <div className={styles.headerActions}>
            <Link href="/dashboard/hr/training/create" className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}>
              <Plus size={18} />
              {t('training.createNew')}
            </Link>
          </div>
        )}
      </div>

      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder={t('search')}
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className={styles.grid}>
          {[1, 2, 3].map(i => <div key={i} className={styles.skeletonCard} />)}
        </div>
      ) : (
        <div className={styles.grid}>
          <AnimatePresence>
            {filteredPaths.map((path, idx) => (
              <motion.div 
                key={path.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={styles.pathCard}
              >
                <div className={styles.cardImageContainer}>
                  {path.thumbnail ? (
                    <img src={path.thumbnail} alt={path.title} className={styles.pathThumbnail} />
                  ) : (
                    <div className={styles.thumbnailPlaceholder}>
                      <GraduationCap size={40} />
                    </div>
                  )}
                  <div className={styles.statusBadge}>
                    {path.status === 'active' ? 'Active' : 'Archived'}
                  </div>
                </div>

                <div className={styles.cardContent}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.pathTitle}>{path.title}</h3>
                    {isAdmin && (
                      <div className={styles.cardMenu}>
                        <button className={styles.iconBtn}>
                          <MoreVertical size={16} />
                        </button>
                        <div className={styles.cardDropdown}>
                          <Link href={`/dashboard/hr/training/${path.id}/edit`} className={styles.dropdownItem}>
                            <Edit2 size={14} /> {t('edit')}
                          </Link>
                          <button onClick={() => handleDelete(path.id)} className={`${styles.dropdownItem} ${styles.dropdownDanger}`}>
                            <Trash2 size={14} /> {t('delete')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <p className={styles.pathDesc}>{path.description}</p>

                  <div className={styles.pathMeta}>
                    <div className={styles.metaItem}>
                      <Layers size={14} />
                      <span>{path.stages.length} {t('training.stages')}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <Clock size={14} />
                      <span>{path.stages.reduce((acc, s) => acc + s.estimatedHours, 0)} {t('training.estimatedHours')}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <Users size={14} />
                      <span>{path.assignedTo.length} {t('training.assignedTo')}</span>
                    </div>
                  </div>

                  <div className={styles.cardActions}>
                    <Link href={`/dashboard/hr/training/${path.id}`} className={styles.viewBtn}>
                      {t('view')} 
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredPaths.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔍</div>
              <h3>No training paths found</h3>
              <p>Try a different search term or create a new path.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
