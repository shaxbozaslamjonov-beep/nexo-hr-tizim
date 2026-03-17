'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  Plus, 
  MoreVertical, 
  Phone, 
  Mail,
  User as UserIcon,
  Briefcase,
  Layers,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { employeeService } from '@/lib/services/employeeService';
import { EmployeeProfile, User } from '@/types';
import styles from './employees.module.css';
import { TableSkeleton } from '@/components/ui/Skeleton';
import Link from 'next/link';

type EmployeeWithUser = EmployeeProfile & { user: User };

export default function EmployeesPage() {
  const { t } = useLanguage();
  const [employees, setEmployees] = useState<EmployeeWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const data = await employeeService.getAllEmployees();
        setEmployees(data);
      } catch (err) {
        console.error('Error fetching employees:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const displayed = employees.filter(emp => {
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    return fullName.includes(search.toLowerCase()) || 
           emp.user.email.toLowerCase().includes(search.toLowerCase()) ||
           emp.position.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="animate-fade-in">
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
              Human Capital
            </span>
          </div>
          <h1 className={styles.title}>{t('workforce')}</h1>
          <p className={styles.subtitle}>Manage and track your organization's talent</p>
        </div>
        
        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <Search className={styles.searchIcon} size={20} />
            <input 
              type="text" 
              placeholder={t('search')} 
              className={styles.searchInput} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={styles.addBtn}
          >
            <Plus size={20} />
            {t('addNew')}
          </motion.button>
        </div>
      </motion.div>

      {loading ? (
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.card} style={{ height: '320px' }}>
              <TableSkeleton rows={1} cols={1} />
              <div style={{ marginTop: '2rem' }}><TableSkeleton rows={4} cols={1} /></div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.grid}>
          <AnimatePresence mode="popLayout">
            {displayed.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ gridColumn: '1 / -1', padding: '6rem', textAlign: 'center' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', color: 'var(--text-light)' }}>
                  <div style={{ width: '80px', height: '80px', background: '#f8fafc', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={40} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{t('noEmployees')}</h3>
                    <p>Try searching for a different name or position</p>
                  </div>
                </div>
              </motion.div>
            ) : displayed.map((emp, index) => (
              <motion.div 
                key={emp.userId}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={styles.card}
              >
                <button className={styles.moreBtn}>
                  <MoreVertical size={20} />
                </button>
                
                <div className={styles.cardTop}>
                  <div className={styles.avatar}>
                    {emp.firstName?.[0]}{emp.lastName?.[0]}
                  </div>
                  <div>
                    <h3 className={styles.empName}>{emp.firstName} {emp.lastName}</h3>
                    <p className={styles.empPos}>{(emp as any).positionRef?.title || emp.position}</p>
                  </div>
                </div>

                <div className={styles.cardInfo}>
                   <div className={styles.infoItem}>
                     <Mail size={16} />
                     {emp.user.email}
                   </div>
                   <div className={styles.infoItem}>
                     <Briefcase size={16} />
                     {emp.department}
                   </div>
                   <div className={styles.badges}>
                     <span className="badge badge-passed" style={{ fontSize: '0.7rem' }}>Active</span>
                     <span className="badge" style={{ fontSize: '0.7rem', background: '#f1f5f9', color: '#64748b' }}>Full-time</span>
                   </div>
                </div>
                
                <div className={styles.cardActions}>
                  <Link href={`/dashboard/hr/employees/${emp.userId}`} className={styles.profileBtn}>
                    <UserIcon size={16} style={{ marginRight: 8 }} />
                    {t('profile')}
                  </Link>
                  <button className={styles.kpiBtn}>
                    <TrendingUp size={16} style={{ marginRight: 8 }} />
                    KPI
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

