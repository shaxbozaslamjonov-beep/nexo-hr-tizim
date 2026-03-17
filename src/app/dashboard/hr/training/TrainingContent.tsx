'use client';

import { useState, useEffect } from 'react';
import { lessonService } from '@/lib/services/lessonService';
import { Lesson } from '@/types';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Plus, Edit2, Trash2, Video, FileText, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import styles from '../vacancies/vacancies.module.css';

export function TrainingContent() {
  const { t, language } = useLanguage();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title_ru: '',
    title_uz: '',
    description_ru: '',
    description_uz: '',
    videoUrl: '',
    assignment_ru: '',
    assignment_uz: '',
  });

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const data = await lessonService.getLessons();
      setLessons(data);
    } catch (e) {
      console.error('Failed to fetch lessons:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const lessonData = {
      title: { ru: form.title_ru, uz: form.title_uz },
      description: { ru: form.description_ru, uz: form.description_uz },
      videoUrl: form.videoUrl,
      assignmentText: (form.assignment_ru || form.assignment_uz) ? { ru: form.assignment_ru, uz: form.assignment_uz } : undefined,
      authorId: '1', // Mock admin ID
    };

    try {
      if (isEditing && currentLessonId) {
        await lessonService.updateLesson(currentLessonId, lessonData);
      } else {
        await lessonService.createLesson(lessonData);
      }
      setModalOpen(false);
      resetForm();
      fetchLessons();
    } catch (e) {
      console.error('Failed to save lesson:', e);
    }
  };

  const resetForm = () => {
    setForm({
      title_ru: '',
      title_uz: '',
      description_ru: '',
      description_uz: '',
      videoUrl: '',
      assignment_ru: '',
      assignment_uz: '',
    });
    setIsEditing(false);
    setCurrentLessonId(null);
  };

  const handleEdit = (lesson: Lesson) => {
    setForm({
      title_ru: lesson.title.ru || '',
      title_uz: lesson.title.uz || '',
      description_ru: lesson.description.ru || '',
      description_uz: lesson.description.uz || '',
      videoUrl: lesson.videoUrl || '',
      assignment_ru: lesson.assignmentText?.ru || '',
      assignment_uz: lesson.assignmentText?.uz || '',
    });
    setIsEditing(true);
    setCurrentLessonId(lesson.id);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('confirmDeleteLesson') || 'Ushbu darsni o\'chirishni tasdiqlaysizmi?')) {
      await lessonService.deleteLesson(id);
      fetchLessons();
    }
  };

  return (
    <div className="animate-fade-in">
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{t('training')}</h1>
          <p className={styles.pageSubtitle}>Xodimlarni o'qitish va malakasini oshirish darslari</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/dashboard/hr/training/assignments" className={styles.actionBtn} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ClipboardList size={18} />
            {t('reviewAssignments')}
          </Link>
          <button
            className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
            onClick={() => { resetForm(); setModalOpen(true); }}
          >
            <Plus size={18} />
            {t('createLesson')}
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>{t('loading')}</p>
      ) : lessons.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🎓</div>
          <p>Hozircha o'quv darslari yaratilmagan. Birinchisini qo'shing!</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {lessons.map((lesson) => (
            <div key={lesson.id} className={styles.vacancyCard}>
              <div className={styles.vacancyCardTop}>
                <div>
                  <div className={styles.vacancyTitle}>{lesson.title[language] || lesson.title['ru']}</div>
                  <div className={styles.vacancyDept}>{new Date(lesson.createdAt).toLocaleDateString()}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                   <button className={styles.iconBtn} onClick={() => handleEdit(lesson)}>
                    <Edit2 size={16} />
                  </button>
                  <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => handleDelete(lesson.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <p className={styles.vacancyDesc}>
                {lesson.description[language] || lesson.description['ru']}
              </p>

              <div className={styles.vacancyMeta} style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                {lesson.videoUrl && (
                  <span className={styles.vacancyMetaItem}>
                    <Video size={14} /> Video
                  </span>
                )}
                {lesson.assignmentText && (
                  <span className={styles.vacancyMetaItem}>
                    <FileText size={14} /> Topshiriq
                  </span>
                )}
              </div>

              <div className={styles.vacancyActions} style={{ marginTop: '1rem' }}>
                <Link href={`/dashboard/learning/lessons/${lesson.id}`} className={styles.actionBtn} style={{ textDecoration: 'none' }}>
                  Ko'rish
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lesson Modal */}
      {modalOpen && (
        <div className={styles.overlay} onClick={() => setModalOpen(false)}>
          <div className={styles.modal} style={{ maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>{isEditing ? t('edit') : t('createLesson')}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Russian Content */}
                <div>
                  <h4 style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Русский язык</h4>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Название *</label>
                    <input
                      className={styles.formInput}
                      required
                      value={form.title_ru}
                      onChange={(e) => setForm({ ...form, title_ru: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Описание *</label>
                    <textarea
                      className={styles.formTextarea}
                      required
                      rows={3}
                      value={form.description_ru}
                      onChange={(e) => setForm({ ...form, description_ru: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Текст задания</label>
                    <textarea
                      className={styles.formTextarea}
                      rows={2}
                      value={form.assignment_ru}
                      onChange={(e) => setForm({ ...form, assignment_ru: e.target.value })}
                    />
                  </div>
                </div>

                {/* Uzbek Content */}
                <div>
                  <h4 style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase' }}>O'zbek tili</h4>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Sarlavha *</label>
                    <input
                      className={styles.formInput}
                      required
                      value={form.title_uz}
                      onChange={(e) => setForm({ ...form, title_uz: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Tavsif *</label>
                    <textarea
                      className={styles.formTextarea}
                      required
                      rows={3}
                      value={form.description_uz}
                      onChange={(e) => setForm({ ...form, description_uz: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Topshiriq matni</label>
                    <textarea
                      className={styles.formTextarea}
                      rows={2}
                      value={form.assignment_uz}
                      onChange={(e) => setForm({ ...form, assignment_uz: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
                <label className={styles.formLabel}>Video URL (YouTube/Vimeo)</label>
                <input
                  className={styles.formInput}
                  placeholder="https://..."
                  value={form.videoUrl}
                  onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.actionBtn} onClick={() => setModalOpen(false)}>
                  {t('cancel')}
                </button>
                <button type="submit" className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}>
                  {isEditing ? t('save') : t('createLesson')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
