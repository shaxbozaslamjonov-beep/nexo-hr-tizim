'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { lessonService } from '@/lib/services/lessonService';
import { ArrowLeft, Video, Layout, Type, FileText } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import styles from '@/components/lessons/lessons.module.css';

export default function CreateLessonPage() {
  const router = useRouter();
  const { isAdmin, user } = useAuth();
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState({
    titleRu: '',
    titleUz: '',
    descriptionRu: '',
    descriptionUz: '',
    videoUrl: '',
    assignmentRu: '',
    assignmentUz: '',
  });
  const [loading, setLoading] = useState(false);

  // Redirect if not admin (could also be done in middleware)
  if (!isAdmin) {
    if (typeof window !== 'undefined') router.push('/dashboard/hr/lessons');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await lessonService.createLesson({
        title: { ru: formData.titleRu, uz: formData.titleUz },
        description: { ru: formData.descriptionRu, uz: formData.descriptionUz },
        videoUrl: formData.videoUrl,
        assignmentText: { ru: formData.assignmentRu, uz: formData.assignmentUz },
        authorId: '1', // Mock admin ID
      });
      router.push('/dashboard/hr/lessons');
    } catch (error) {
      console.error('Failed to create lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <DashboardLayout
      role={user?.role || 'EMPLOYEE'}
      userName={`${user?.firstName || ''} ${user?.lastName || ''}`}
      breadcrumbs={[{ label: t('lessons'), href: '/dashboard/hr/lessons' }, { label: t('createLesson') }]}
    >
      <div className="page-container">
        <Link href="/dashboard/hr/lessons" className={styles.viewLink} style={{ marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={16} /> Back to lessons
        </Link>
  
        <div className={styles.formContainer}>
          <h1 className={styles.formTitle}>{t('createLesson')}</h1>
  
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>{t('lessonTitle')} (RU)</label>
                <input name="titleRu" className={styles.input} value={formData.titleRu} onChange={handleChange} required />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>{t('lessonTitle')} (UZ)</label>
                <input name="titleUz" className={styles.input} value={formData.titleUz} onChange={handleChange} required />
              </div>
            </div>
  
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>{t('lessonDescription')} (RU)</label>
                <textarea name="descriptionRu" className={styles.textarea} value={formData.descriptionRu} onChange={handleChange} required />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>{t('lessonDescription')} (UZ)</label>
                <textarea name="descriptionUz" className={styles.textarea} value={formData.descriptionUz} onChange={handleChange} required />
              </div>
            </div>
  
            <div className={styles.inputGroup}>
              <label className={styles.label}>{t('videoUrl')} (YouTube)</label>
              <div style={{ position: 'relative' }}>
                <Video size={18} style={{ position: 'absolute', left: '1rem', top: '0.875rem', color: 'rgba(255, 255, 255, 0.4)' }} />
                <input name="videoUrl" className={styles.input} style={{ paddingLeft: '3rem' }} value={formData.videoUrl} onChange={handleChange} placeholder="https://www.youtube.com/watch?v=..." />
              </div>
            </div>
  
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>{t('assignment')} (RU)</label>
                <textarea name="assignmentRu" className={styles.textarea} value={formData.assignmentRu} onChange={handleChange} placeholder="Optional assignment instructions..." />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>{t('assignment')} (UZ)</label>
                <textarea name="assignmentUz" className={styles.textarea} value={formData.assignmentUz} onChange={handleChange} placeholder="Optional assignment instructions..." />
              </div>
            </div>
  
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Creating...' : t('createLesson')}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
