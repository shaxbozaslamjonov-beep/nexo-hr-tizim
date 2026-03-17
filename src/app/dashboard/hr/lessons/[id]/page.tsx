'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { lessonService } from '@/lib/services/lessonService';
import { Lesson, Assignment } from '@/types';
import { ArrowLeft, Video, FileText, Send, CheckCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import styles from '@/components/lessons/lessons.module.css';

export default function LessonDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const { showToast } = useToast();
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submissionText, setSubmissionText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id || typeof id !== 'string' || !user) return;
      
      try {
        const [lessonData, assignmentsData] = await Promise.all([
          lessonService.getLessonById(id),
          lessonService.getAssignmentsByUser(user.id)
        ]);
        
        if (lessonData) {
          setLesson(lessonData);
        } else {
          router.push('/dashboard/hr/lessons');
        }
        
        const assignmentData = assignmentsData?.find((a: Assignment) => a.lessonId === id) || null;
        if (assignmentData) {
          setAssignment(assignmentData);
          setSubmissionText(assignmentData.submissionText || '');
        }
      } catch (error) {
        console.error('Failed to fetch lesson details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, user, router]);

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lesson || !user || !submissionText.trim()) return;
    
    setSubmitting(true);
    try {
      const result = await lessonService.submitAssignment(lesson.id, user.id, submissionText);
      setAssignment(result);
      showToast('Topshiriq muvaffaqiyatli yuborildi!', 'success');
    } catch (error) {
      console.error('Failed to submit assignment:', error);
      showToast('Xatolik yuz berdi. Iltimos qaytadan urinib ko\'ring.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ color: 'white', textAlign: 'center', padding: '5rem' }}>Loading lesson...</div>;
  if (!lesson) return null;

  const title = lesson.title[language] || lesson.title['ru'];
  const description = lesson.description[language] || lesson.description['ru'];
  const prompt = lesson.assignmentText?.[language] || lesson.assignmentText?.['ru'];

  // Helper to extract YouTube ID
  const getEmbedUrl = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const embedUrl = getEmbedUrl(lesson.videoUrl);

  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <Link href="/dashboard/hr/lessons" className={styles.viewLink} style={{ marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        <ArrowLeft size={16} /> Back to lessons
      </Link>

      <div className={styles.formContainer} style={{ maxWidth: 'none', background: 'transparent', border: 'none', padding: 0 }}>
        <h1 className={styles.formTitle} style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{title}</h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '2rem', fontSize: '1.1rem' }}>{description}</p>

        {embedUrl && (
          <div className={styles.videoWrapper}>
            <iframe src={embedUrl} allowFullScreen title={title} />
          </div>
        )}

        {lesson.assignmentText && (
          <div className={styles.assignmentSection}>
            <h2 className={styles.assignmentTitle}>
              <FileText size={24} color="#C850C0" />
              {t('assignment')}
            </h2>
            
            <div className={styles.assignmentPrompt}>
              {prompt}
            </div>

            {assignment ? (
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '2rem', borderRadius: '1.5rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div className={`${styles.statusBadge} ${assignment.status === 'SUBMITTED' ? styles.statusSubmitted : styles.statusChecked}`}>
                  {assignment.status === 'SUBMITTED' ? <Send size={16} style={{marginRight: '0.5rem'}} /> : <CheckCircle size={16} style={{marginRight: '0.5rem'}} />}
                  {assignment.status === 'SUBMITTED' ? t('statusSubmitted') : t('statusChecked')}
                </div>
                <h3 style={{ color: 'white', marginBottom: '1rem' }}>Your Submission:</h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.8)', whiteSpace: 'pre-wrap' }}>{assignment.submissionText}</p>
                <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.4)' }}>
                  Submitted on {new Date(assignment.submittedAt).toLocaleString()}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitAssignment} className={styles.formContainer} style={{ background: 'rgba(255, 255, 255, 0.05)', maxWidth: 'none' }}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Your Response</label>
                  <textarea
                    className={styles.textarea}
                    placeholder="Enter your answer or notes here..."
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className={styles.submitBtn} disabled={submitting}>
                  {submitting ? 'Submitting...' : t('submitAssignment')}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
