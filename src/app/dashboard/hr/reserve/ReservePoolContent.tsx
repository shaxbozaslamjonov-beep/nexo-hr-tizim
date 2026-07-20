'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Layers, 
  List, 
  Search, 
  Calendar, 
  Briefcase, 
  Clock, 
  ArrowRight, 
  Trash2, 
  UserPlus,
  Filter,
  MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { reserveService } from '@/lib/services/reserveService';
import { ReserveCandidate } from '@/types';
import styles from './reserve.module.css';
import toast from 'react-hot-toast';

export function ReservePoolContent() {
  const { t, language } = useLanguage();
  const [reserve, setReserve] = useState<ReserveCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await reserveService.getReserveList();
      setReserve(data);
    } catch (error) {
      console.error('Failed to load reserve pool:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReserve = useMemo(() => {
    return reserve.filter(r => {
      const searchStr = `${r.candidateName} ${r.vacancyTitle}`.toLowerCase();
      return searchStr.includes(searchTerm.toLowerCase());
    });
  }, [reserve, searchTerm]);

  const handleUpdateStatus = async (id: string, status: ReserveCandidate['status']) => {
    try {
      reserveService.updateReserveStatus(id, status);
      setReserve(reserve.map(r => r.id === id ? { ...r, status } : r));
      toast.success('Status updated');
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const kanbanColumns = [
    { id: 'active', title: 'Active Reserve', icon: <Users size={18} /> },
    { id: 'hired', title: 'Hired', icon: <UserPlus size={18} /> },
    { id: 'removed', title: 'Removed', icon: <Trash2 size={18} /> }
  ];

  return (
    <div className={styles.pageContainer}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={styles.headerArea}
      >
        <div className={styles.headerBg} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.2)', borderRadius: '10px' }}>
              <Layers size={20} color="white" />
            </div>
            <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.7rem' }}>
              Candidate Reserve Pool
            </span>
          </div>
          <h1 className={styles.title}>{t('reserve.title')}</h1>
          <p className={styles.subtitle}>Manage "Silver Medalist" candidates for future opportunities</p>
        </div>
        
        <div className={styles.controls}>
          <div className={styles.tabSwitch}>
            <button 
              className={`${styles.tabBtn} ${viewMode === 'kanban' ? styles.tabBtnActive : ''}`}
              onClick={() => setViewMode('kanban')}
            >
              <Layers size={18} />
              Kanban
            </button>
            <button 
              className={`${styles.tabBtn} ${viewMode === 'list' ? styles.tabBtnActive : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List size={18} />
              {t('list')}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
             <div style={{ 
               background: 'rgba(255,255,255,0.1)', 
               backdropFilter: 'blur(10px)', 
               borderRadius: '12px', 
               padding: '0 1rem', 
               display: 'flex', 
               alignItems: 'center',
               border: '1px solid rgba(255,255,255,0.2)'
             }}>
               <Search size={18} color="rgba(255,255,255,0.5)" />
               <input 
                 type="text" 
                 placeholder={t('search')} 
                 className="transparent-input" 
                 style={{ border: 'none', background: 'transparent', padding: '0.75rem', color: 'white', outline: 'none' }}
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>

             <button className="btn-glass" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
               <Filter size={20} />
               Filter
             </button>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-light)' }}>
          <div className="loader"></div>
          <p>{t('loading')}</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {viewMode === 'kanban' ? (
            <motion.div 
              key="kanban"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={styles.kanbanBoard}
            >
              {kanbanColumns.map(col => {
                const colReserve = filteredReserve.filter(r => r.status === col.id);
                return (
                  <div key={col.id} className={styles.kanbanColumn}>
                    <div className={styles.columnHeader}>
                      <h3 className={styles.columnTitle}>
                        {col.icon}
                        {col.title}
                      </h3>
                      <span className={styles.columnCount}>{colReserve.length}</span>
                    </div>

                    {colReserve.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2rem', border: '2px dashed rgba(0,0,0,0.05)', borderRadius: '16px', color: '#94a3b8', fontSize: '0.875rem' }}>
                        Empty
                      </div>
                    ) : colReserve.map(r => (
                      <div key={r.id} className={styles.reserveCard}>
                        <div className={styles.cardTop}>
                          <div>
                            <h4 className={styles.cardTitle}>{r.candidateName}</h4>
                            <p className={styles.cardSubtitle}>{r.vacancyTitle}</p>
                          </div>
                          <span className={styles.cardSource}>{r.source}</span>
                        </div>
                        
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.5rem 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {r.notes}
                        </p>

                        <div className={styles.cardMeta}>
                          <div className={styles.metaItem}>
                            <Calendar size={12} />
                            {new Date(r.addedAt).toLocaleDateString()}
                          </div>
                          <div className={styles.metaItem} style={{ marginLeft: 'auto' }}>
                            <ArrowRight size={14} color="var(--primary)" />
                          </div>
                        </div>

                        <div className={styles.cardActions}>
                           {col.id !== 'active' && (
                             <button className={styles.actionBtn} onClick={() => handleUpdateStatus(r.id, 'active')}>
                               Activate
                             </button>
                           )}
                           {col.id !== 'hired' && (
                             <button className={styles.actionBtn} onClick={() => handleUpdateStatus(r.id, 'hired')}>
                               Hired
                             </button>
                           )}
                           {col.id !== 'removed' && (
                             <button className={styles.actionBtn} onClick={() => handleUpdateStatus(r.id, 'removed')}>
                               Remove
                             </button>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="card-glass"
              style={{ overflow: 'hidden' }}
            >
              <table className="table-premium">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Position</th>
                    <th>Status</th>
                    <th>Added At</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReserve.map(r => (
                    <tr key={r.id}>
                      <td>{r.candidateName}</td>
                      <td>{r.vacancyTitle}</td>
                      <td>
                        <span className={`badge badge-${r.status}`}>
                          {r.status}
                        </span>
                      </td>
                      <td>{new Date(r.addedAt).toLocaleDateString()}</td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.notes}
                      </td>
                      <td>
                        <button className="btn-icon">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
