'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { lessonService } from '@/lib/services/lessonService';
import { Lesson } from '@/types';
import { LessonCard } from '@/components/lessons/LessonCard';
import { Plus, Search, BookOpen, GraduationCap, Video, Layers, Zap } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import styles from './lessons_premium.module.css';

export default function LessonsPage() {
  const { isAdmin, user } = useAuth();
  const { t } = useLanguage();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const data = await lessonService.getLessons();
        setLessons(data);
      } catch (error) {
        console.error('Failed to fetch lessons:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, []);

  const filteredLessons = lessons.filter(lesson => {
    const title = (lesson.title.ru + lesson.title.uz).toLowerCase();
    return title.includes(searchTerm.toLowerCase());
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
              <GraduationCap size={20} color="white" />
            </div>
            <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.7rem' }}>
              Knowledge Center
            </span>
          </div>
          <h1 className={styles.title}>{t('lessons')}</h1>
          <p className={styles.subtitle}>Explore and manage training materials for your growth</p>
        </div>
        
        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <Search className={styles.searchIcon} size={20} />
            <input 
              type="text" 
              placeholder={t('search')} 
              className={styles.searchInput} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {isAdmin && (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={styles.addBtn}
              onClick={() => window.location.href = '/dashboard/hr/lessons/create'}
            >
              <Plus size={20} />
              {t('createLesson')}
            </motion.button>
          )}
        </div>
      </motion.div>

      {loading ? (
        <div className={styles.loading}>Loading training materials...</div>
      ) : (
        <div className={styles.grid}>
          <AnimatePresence mode="popLayout">
            {filteredLessons.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={styles.emptyState}
              >
                <div style={{ width: '80px', height: '80px', background: '#f8fafc', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={40} color="#94a3b8" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No lessons found</h3>
                  <p>Try searching for a different title or keyword</p>
                </div>
              </motion.div>
            ) : filteredLessons.map((lesson, index) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <LessonCard lesson={lesson} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

