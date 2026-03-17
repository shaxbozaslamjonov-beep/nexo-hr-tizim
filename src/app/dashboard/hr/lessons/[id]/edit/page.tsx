'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { lessonService } from '@/lib/services/lessonService';
import { Lesson } from '@/types';
import { ArrowLeft, Save, X, Trash2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import Link from 'next/link';
import styles from '@/components/lessons/lessons.module.css';

export default function LessonEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [formData, setFormData] = useState<Partial<Lesson>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      if (!id || typeof id !== 'string') return;
      const data = await lessonService.getLessonById(id);
      if (data) {
        setLesson(data);
        setFormData(data);
      } else {
        router.push('/dashboard/hr/lessons');
      }
      setLoading(false);
    };
    fetchLesson();
  }, [id, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [field, lang] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [field]: { ...(prev[field as keyof Lesson] as any), [lang]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || typeof id !== 'string') return;
    
    setSaving(true);
    try {
      const updated = await lessonService.updateLesson(id, formData);
      if (updated) {
        showToast('Lesson updated successfully', 'success');
        router.push('/dashboard/hr/lessons');
      }
    } catch (err) {
      showToast('Failed to update lesson', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ color: 'white', textAlign: 'center', padding: '5rem' }}>Loading lesson...</div>;
  if (!lesson) return null;

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <Link href="/dashboard/hr/lessons" className={styles.viewLink} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={16} /> Back to Lessons
        </Link>
        <h1 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800 }}>Edit Lesson</h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.formContainer} style={{ background: 'rgba(255, 255, 255, 0.05)', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Title (RU)</label>
            <input 
              className={styles.input} 
              name="title.ru" 
              value={formData.title?.ru || ''} 
              onChange={handleInputChange} 
              required 
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Title (UZ)</label>
            <input 
              className={styles.input} 
              name="title.uz" 
              value={formData.title?.uz || ''} 
              onChange={handleInputChange} 
              required 
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Description (RU)</label>
            <textarea 
              className={styles.textarea} 
              name="description.ru" 
              value={formData.description?.ru || ''} 
              onChange={handleInputChange} 
              required 
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Description (UZ)</label>
            <textarea 
              className={styles.textarea} 
              name="description.uz" 
              value={formData.description?.uz || ''} 
              onChange={handleInputChange} 
              required 
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Video URL</label>
            <input 
              className={styles.input} 
              name="videoUrl" 
              value={formData.videoUrl || ''} 
              onChange={handleInputChange} 
              placeholder="YouTube or Vimeo link"
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Assignment Instructions (RU)</label>
            <textarea 
              className={styles.textarea} 
              name="assignmentText.ru" 
              value={formData.assignmentText?.ru || ''} 
              onChange={handleInputChange} 
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Assignment Instructions (UZ)</label>
            <textarea 
              className={styles.textarea} 
              name="assignmentText.uz" 
              value={formData.assignmentText?.uz || ''} 
              onChange={handleInputChange} 
            />
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
            <button 
              type="submit" 
              disabled={saving}
              className={styles.submitBtn}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button 
              type="button" 
              onClick={() => router.push('/dashboard/hr/lessons')}
              className={styles.viewLink}
              style={{ background: 'rgba(255,255,255,0.05)', padding: '0 2rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={18} /> Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
