'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lesson } from '@/types';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Video, FileText, Calendar, ArrowRight, BookOpen, Clock, BarChart, Eye, X } from 'lucide-react';
import { useState } from 'react';
import styles from '@/app/dashboard/hr/lessons/lessons_premium.module.css';

interface LessonCardProps {
  lesson: Lesson;
}

export function LessonCard({ lesson }: LessonCardProps) {
  const { language, t } = useLanguage();
  const title = lesson.title[language] || lesson.title['ru'];
  const description = lesson.description[language] || lesson.description['ru'];

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState<any>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const openPreview = async () => {
    setIsPreviewOpen(true);
    setLoadingPreview(true);
    try {
      const res = await fetch(`/api/lessons/${lesson.id}/preview`);
      if (res.ok) {
        const data = await res.json();
        // Fallback to local lesson data if API returns mock
        setPreviewContent({
          type: lesson.videoUrl ? 'video' : lesson.fileAttachment ? 'pdf' : 'text',
          content: lesson.videoUrl || lesson.fileAttachment?.url || description
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPreview(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.iconContainer}>
          {lesson.videoUrl ? <Video size={28} /> : <BookOpen size={28} />}
        </div>
        <div className={styles.headerInfo}>
          <h3 className={styles.lessonTitle}>{title}</h3>
          <div className={styles.meta}>
            <Calendar size={14} />
            <span>{new Date(lesson.createdAt).toLocaleDateString()}</span>
            <span style={{ margin: '0 0.5rem', opacity: 0.3 }}>•</span>
            <Clock size={14} />
            <span>15 min</span>
          </div>
        </div>
      </div>
      
      <p className={styles.description}>{description}</p>
      
      <div className={styles.cardFooter}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)' }}>
            <BarChart size={14} />
            <span>Beginner</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={openPreview} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>
            <Eye size={18} /> Ko'rish
          </button>
          <Link href={`/dashboard/hr/lessons/${lesson.id}/edit`} className={styles.editBtn}>
            {t('edit')}
          </Link>
          <Link href={`/dashboard/hr/lessons/${lesson.id}`} className={styles.viewLink}>
            {t('view')} <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {isPreviewOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--surface)', borderRadius: '16px', width: '90%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{title} - Preview</h3>
              <button onClick={() => setIsPreviewOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
              {loadingPreview ? (
                <div style={{ textAlign: 'center', color: '#94a3b8' }}>Loading content...</div>
              ) : previewContent ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {previewContent.type === 'video' ? (
                    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                      <iframe src={typeof previewContent.content === 'string' ? previewContent.content : ''} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '8px' }} frameBorder="0" allowFullScreen />
                    </div>
                  ) : previewContent.type === 'pdf' ? (
                    <iframe src={typeof previewContent.content === 'string' ? previewContent.content : ''} style={{ width: '100%', height: '500px', border: 'none', borderRadius: '8px' }} />
                  ) : (
                    <div style={{ padding: '2rem', background: 'var(--background)', borderRadius: '12px', fontSize: '1.1rem', lineHeight: 1.6 }}>
                      {typeof previewContent.content === 'string' ? previewContent.content : 'No content available'}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  Kontent mavjud emas
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

