'use client';

import { useState, useEffect, useMemo } from 'react';
import { testService } from '@/lib/services/testService';
import { Test, TestResult } from '@/types';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  ClipboardCheck, 
  Clock, 
  Users, 
  Award,
  Search,
  Filter,
  Download,
  Upload,
  ChevronRight,
  MoreVertical,
  Activity,
  CheckCircle2,
  XCircle,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import styles from './tests.module.css';
import { TableSkeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';
import { exportService } from '@/lib/services/exportService';

export function TestsContent() {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTest, setCurrentTest] = useState<Test | null>(null);
  
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Development',
    timeLimit: 30,
    passingScore: 70,
    attemptsAllowed: 1,
    status: 'active' as any,
    shuffleQuestions: true,
    shuffleOptions: true,
    showResultImmediately: true
  });

  const fetchTests = async () => {
    setLoading(true);
    try {
      const [testsData, resultsData] = await Promise.all([
        testService.getAllTests(),
        testService.getAllTestResults()
      ]);
      setTests(testsData);
      setResults(resultsData);
    } catch (e) {
      console.error('Failed to fetch tests:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(tests.map(t => t.category));
    return ['ALL', ...Array.from(cats)];
  }, [tests]);

  const filteredTests = tests.filter(test => {
    const matchSearch = test.title.toLowerCase().includes(search.toLowerCase()) || 
                      test.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'ALL' || test.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && currentTest) {
        await testService.updateTest(currentTest.id, form);
        toast.success(t('save') || 'Saved');
      } else {
        await testService.createTest({
          ...form,
          questions: [],
          createdBy: '1',
        });
        toast.success(t('created') || 'Created');
      }
      setModalOpen(false);
      resetForm();
      fetchTests();
    } catch (e) {
      toast.error('Operation failed');
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      category: 'Development',
      timeLimit: 30,
      passingScore: 70,
      attemptsAllowed: 1,
      status: 'active',
      shuffleQuestions: true,
      shuffleOptions: true,
      showResultImmediately: true
    });
    setIsEditing(false);
    setCurrentTest(null);
  };

  const handleEdit = (test: Test) => {
    setForm({
      title: test.title,
      description: test.description,
      category: test.category,
      timeLimit: test.timeLimit,
      passingScore: test.passingScore,
      attemptsAllowed: test.attemptsAllowed,
      status: test.status,
      shuffleQuestions: test.shuffleQuestions,
      shuffleOptions: test.shuffleOptions,
      showResultImmediately: test.showResultImmediately
    });
    setIsEditing(true);
    setCurrentTest(test);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('confirmDelete') || 'Are you sure?')) {
      await testService.deleteTest(id);
      fetchTests();
      toast.success(t('deleted'));
    }
  };

  const handleExport = (test: Test) => {
    const data = test.questions.map((q, idx) => ({
      '#': idx + 1,
      'Question': q.question,
      'Type': q.type,
      'Options': q.options?.join(' | ') || '',
      'Correct Answers (indices)': q.correctAnswers?.join(',') || '',
      'Points': q.points
    }));
    exportService.toExcel(data, `Test_${test.title.replace(/\s+/g, '_')}`);
    toast.success('Test exported to Excel');
  };

  const handleImport = () => {
    toast.error('Import spreadsheet parsing coming in next update. Please use manual entry for now.');
  };

  const openAnalytics = async (test: Test) => {
    setCurrentTest(test);
    setAnalyticsOpen(true);
    setLoadingAnalytics(true);
    try {
      const res = await fetch(`/api/tests/${test.id}/analytics`);
      const data = await res.json();
      setAnalyticsData(data);
    } catch (e) {
      toast.error('Failed to load analytics');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className={styles.pageHeader}>
        <div className={styles.headerBg} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 className={styles.pageTitle}>{t('tests.title')}</h1>
          <p className={styles.pageSubtitle}>Assessment and evaluation management</p>
        </div>
        {isAdmin && (
          <div className={styles.headerActions}>
            <button
              className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
              onClick={() => { resetForm(); setModalOpen(true); }}
            >
              <Plus size={18} />
              {t('tests.addQuestion')}
            </button>
          </div>
        )}
      </div>

      <div className={styles.controls}>
        <div className={styles.filters}>
          {categories.map(cat => (
            <button 
              key={cat}
              className={`${styles.filterBtn} ${categoryFilter === cat ? styles.filterBtnActive : ''}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat === 'ALL' ? t('all') : cat}
            </button>
          ))}
        </div>

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
        <div className={styles.tableSkeleton}>
           <TableSkeleton rows={6} />
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredTests.map((test) => {
            const testResults = results.filter(r => r.testId === test.id);
            const avgScore = testResults.length > 0 
              ? Math.round(testResults.reduce((acc, r) => acc + r.score, 0) / testResults.length)
              : 0;

            return (
              <motion.div 
                key={test.id} 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={styles.testCard}
              >
                <div className={styles.cardTop}>
                  <div className={styles.categoryTag}>{test.category}</div>
                  <div className={styles.statusDot} style={{ background: test.status === 'active' ? '#10b981' : '#94a3b8' }} />
                </div>

                <div className={styles.cardMain}>
                  <h3 className={styles.testTitle}>{test.title}</h3>
                  <p className={styles.testDesc}>{test.description}</p>
                </div>

                <div className={styles.statsRow}>
                   <div className={styles.statItem}>
                      <ClipboardCheck size={16} />
                      <span>{test.questions.length} Qns</span>
                   </div>
                   <div className={styles.statItem}>
                      <Clock size={16} />
                      <span>{test.timeLimit}m</span>
                   </div>
                   <div className={styles.statItem}>
                      <BarChart3 size={16} />
                      <span>{avgScore}% Avg</span>
                   </div>
                </div>

                <div className={styles.cardFooter}>
                  <Link href={`/dashboard/hr/tests/${test.id}`} className={styles.manageBtn}>
                    {isAdmin ? 'Manage' : 'Take Test'}
                    <ChevronRight size={16} />
                  </Link>
                  {isAdmin && (
                    <div className={styles.adminActions}>
                      <Link href={`/dashboard/hr/tests/${test.id}/edit`} className={styles.iconBtn} title="Edit">
                        <Edit2 size={14} />
                      </Link>
                      <button onClick={() => openAnalytics(test)} className={styles.iconBtn} title="Analytics">
                        <Activity size={14} />
                      </button>
                      <button onClick={() => handleExport(test)} className={styles.iconBtn} title="Export">
                        <Download size={14} />
                      </button>
                      <button onClick={() => handleDelete(test.id)} className={`${styles.iconBtn} ${styles.iconBtnDanger}`} title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Test Modal (Create/Edit) */}
      <AnimatePresence>
        {modalOpen && (
          <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className={styles.modal} 
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2>{isEditing ? t('edit') : t('tests.title')}</h2>
                <button className={styles.closeBtn} onClick={() => setModalOpen(false)}>&times;</button>
              </div>

              <form onSubmit={handleSubmit} className={styles.modalContent}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                    <label>{t('vacancies.form.title')} *</label>
                    <input 
                      type="text" 
                      required 
                      value={form.title}
                      onChange={e => setForm({...form, title: e.target.value})}
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                    <label>{t('vacancies.form.description')} *</label>
                    <textarea 
                      required 
                      rows={3}
                      value={form.description}
                      onChange={e => setForm({...form, description: e.target.value})}
                      className={styles.formTextarea}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>{t('tests.category')} *</label>
                    <input 
                      type="text" 
                      required 
                      value={form.category}
                      onChange={e => setForm({...form, category: e.target.value})}
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>{t('tests.timeLimit')} *</label>
                    <input 
                      type="number" 
                      required 
                      value={form.timeLimit}
                      onChange={e => setForm({...form, timeLimit: parseInt(e.target.value)})}
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>{t('tests.passingScore')} (%) *</label>
                    <input 
                      type="number" 
                      required 
                      min="0" max="100"
                      value={form.passingScore}
                      onChange={e => setForm({...form, passingScore: parseInt(e.target.value)})}
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>{t('tests.attemptsAllowed')} *</label>
                    <input 
                      type="number" 
                      required 
                      min="0"
                      value={form.attemptsAllowed}
                      onChange={e => setForm({...form, attemptsAllowed: parseInt(e.target.value)})}
                      className={styles.formInput}
                    />
                  </div>
                </div>

                <div className={styles.toggleSection}>
                   <label className={styles.toggleItem}>
                      <input type="checkbox" checked={form.shuffleQuestions} onChange={e => setForm({...form, shuffleQuestions: e.target.checked})} />
                      <span>{t('tests.shuffleQuestions')}</span>
                   </label>
                   <label className={styles.toggleItem}>
                      <input type="checkbox" checked={form.shuffleOptions} onChange={e => setForm({...form, shuffleOptions: e.target.checked})} />
                      <span>{t('tests.shuffleOptions')}</span>
                   </label>
                   <label className={styles.toggleItem}>
                      <input type="checkbox" checked={form.showResultImmediately} onChange={e => setForm({...form, showResultImmediately: e.target.checked})} />
                      <span>{t('tests.showResultImmediately')}</span>
                   </label>
                </div>

                <div className={styles.modalFooter}>
                  <button type="button" onClick={() => setModalOpen(false)} className={styles.cancelBtn}>
                    {t('cancel')}
                  </button>
                  <button type="submit" className={styles.saveBtn}>
                    {isEditing ? t('save') : t('create')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Analytics Modal */}
      <AnimatePresence>
        {analyticsOpen && currentTest && (
          <div className={styles.modalOverlay} onClick={() => setAnalyticsOpen(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '800px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{currentTest.title} - Analytics</h2>
                <button onClick={() => setAnalyticsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--text-secondary)' }}>&times;</button>
              </div>

              {loadingAnalytics ? (
                <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>Loading analytics...</div>
              ) : analyticsData ? (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ background: 'var(--background)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0ea5e9' }}>{analyticsData.totalAttempts}</div>
                      <div style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Total Attempts</div>
                    </div>
                    <div style={{ background: 'var(--background)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b' }}>{analyticsData.averageScore}%</div>
                      <div style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Average Score</div>
                    </div>
                    <div style={{ background: 'var(--background)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>{analyticsData.successRate}%</div>
                      <div style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Success Rate</div>
                    </div>
                  </div>

                  {analyticsData.distribution && analyticsData.distribution.length > 0 && (
                    <div style={{ height: '300px' }}>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Score Distribution</h3>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.distribution}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="range" axisLine={false} tickLine={false} />
                          <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                          <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                          <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No data available</div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
