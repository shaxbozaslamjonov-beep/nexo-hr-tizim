'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  List, 
  Plus, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Video, 
  MapPin, 
  Phone,
  MoreVertical,
  CalendarCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { interviewService } from '@/lib/services/interviewService';
import { Interview } from '@/types';
import styles from './interviews.module.css';

export function InterviewsContent() {
  const { t, language } = useLanguage();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await interviewService.getInterviews();
      setInterviews(data);
    } catch (error) {
      console.error('Failed to load interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInterviews = useMemo(() => {
    return interviews.filter(i => {
      const searchStr = `${i.candidateName} ${i.vacancyTitle}`.toLowerCase();
      return searchStr.includes(searchTerm.toLowerCase());
    });
  }, [interviews, searchTerm]);

  // Calendar Logic
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = [];
    const firstDay = firstDayOfMonth(year, month);
    const totalDays = daysInMonth(year, month);

    // Padding for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, date: null });
    }

    // Days of current month
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i);
      days.push({ day: i, date });
    }

    return days;
  }, [currentDate]);

  const changeMonth = (offset: number) => {
    const nextDate = new Date(currentDate);
    nextDate.setMonth(currentDate.getMonth() + offset);
    setCurrentDate(nextDate);
  };

  const currentMonthName = currentDate.toLocaleString(language === 'uz' ? 'uz-UZ' : 'ru-RU', { month: 'long', year: 'numeric' });

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
              <CalendarCheck size={20} color="white" />
            </div>
            <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.7rem' }}>
              Assessment Scheduler
            </span>
          </div>
          <h1 className={styles.title}>{t('interviews.title')}</h1>
          <p className={styles.subtitle}>Manage and track candidate assessments and scheduling</p>
        </div>
        
        <div className={styles.controls}>
          <div className={styles.tabSwitch}>
            <button 
              className={`${styles.tabBtn} ${viewMode === 'list' ? styles.tabBtnActive : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List size={18} />
              {t('interviews.list')}
            </button>
            <button 
              className={`${styles.tabBtn} ${viewMode === 'calendar' ? styles.tabBtnActive : ''}`}
              onClick={() => setViewMode('calendar')}
            >
              <CalendarIcon size={18} />
              {t('interviews.calendar')}
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

             <button 
               className={styles.addBtn}
               onClick={() => window.location.href = '/dashboard/hr/interviews/create'}
             >
               <Plus size={20} />
               {t('interviews.schedule')}
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
          {viewMode === 'list' ? (
            <motion.div 
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={styles.gridView}
            >
              {filteredInterviews.length === 0 ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem', background: 'var(--surface)', borderRadius: '24px' }}>
                  <CalendarIcon size={64} color="#e2e8f0" style={{ marginBottom: '1rem' }} />
                  <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>No interviews found</p>
                </div>
              ) : filteredInterviews.map((interview) => (
                <div key={interview.id} className={styles.interviewCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.candidateInfo}>
                      <h3>{interview.candidateName}</h3>
                      <p>{interview.vacancyTitle}</p>
                    </div>
                    <span className={`badge badge-${interview.status}`}>
                      {t(`interviews.status.${interview.status}`)}
                    </span>
                  </div>

                  <div className={styles.timeInfo}>
                    <div className={styles.infoItem}>
                      <CalendarIcon size={16} color="var(--primary)" />
                      {new Date(interview.scheduledDate).toLocaleDateString(language === 'uz' ? 'uz-UZ' : 'ru-RU')}
                    </div>
                    <div className={styles.infoItem}>
                      <Clock size={16} color="var(--primary)" />
                      {new Date(interview.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div className={styles.infoItem} style={{ marginBottom: '1.5rem' }}>
                    {interview.type === 'online' ? <Video size={16} /> : interview.type === 'phone' ? <Phone size={16} /> : <MapPin size={16} />}
                    <span style={{ fontSize: '0.875rem' }}>{interview.location || t(`interviews.type.${interview.type}`)}</span>
                  </div>

                  <div className={styles.cardFooter}>
                    {interview.result && (
                      <span className={`${styles.resultBadge} ${interview.result === 'passed' ? styles.resultPassed : interview.result === 'failed' ? styles.resultFailed : styles.resultPending}`}>
                        {t(`interviews.result.${interview.result}`)}
                      </span>
                    )}
                    <button 
                      className="btn-glass"
                      style={{ marginLeft: 'auto' }}
                      onClick={() => window.location.href = `/dashboard/hr/interviews/${interview.id}`}
                    >
                      {t('viewProfile')}
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="calendar"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={styles.calendarWrapper}
            >
              <div className={styles.calendarHeader}>
                <h2 className={styles.monthTitle}>{currentMonthName}</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                   <button className="btn-icon" onClick={() => changeMonth(-1)}><ChevronLeft size={20}/></button>
                   <button className="btn-icon" onClick={() => setCurrentDate(new Date())}>Today</button>
                   <button className="btn-icon" onClick={() => changeMonth(1)}><ChevronRight size={20}/></button>
                </div>
              </div>

              <div className={styles.calendarGrid}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className={styles.dayHeader}>{day}</div>
                ))}
                
                {calendarDays.map((dateObj, idx) => {
                  const isToday = dateObj.date && dateObj.date.toDateString() === new Date().toDateString();
                  const dayInterviews = dateObj.date 
                    ? interviews.filter(i => new Date(i.scheduledDate).toDateString() === dateObj.date?.toDateString())
                    : [];

                  return (
                    <div key={idx} className={`${styles.dayCell} ${isToday ? styles.today : ''}`}>
                      {dateObj.day && <span className={styles.dayNumber}>{dateObj.day}</span>}
                      {dayInterviews.map(i => (
                        <div 
                          key={i.id} 
                          className={`${styles.eventCard} ${styles[`event${i.status.charAt(0).toUpperCase() + i.status.slice(1)}`]}`}
                          onClick={() => window.location.href = `/dashboard/hr/interviews/${i.id}`}
                        >
                          {new Date(i.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {i.candidateName}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
