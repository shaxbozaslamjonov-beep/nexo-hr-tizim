'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { employeeService } from '@/lib/services/employeeService';
import { lessonService } from '@/lib/services/lessonService';
import { EmployeeProfile, Lesson, Assignment, User } from '@/types';
import { 
  ArrowLeft, 
  BookOpen, 
  Award, 
  Calendar, 
  Briefcase, 
  Clock,
  CheckCircle2,
  Edit2,
  Check,
  X as XIcon,
  Phone,
  Mail
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import Link from 'next/link';
import styles from '@/components/lessons/lessons.module.css';

type EmployeeWithUser = EmployeeProfile & { user: User };

export default function EmployeeProfilePage() {
  const { id } = useParams(); // userId
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  
  const [employee, setEmployee] = useState<EmployeeWithUser | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [positions, setPositions] = useState<{ id: string, title: string }[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id || typeof id !== 'string') return;
      
      try {
        const [empData, lessonData, assignData, posData] = await Promise.all([
          employeeService.getProfileByUserId(id),
          lessonService.getLessons(),
          lessonService.getAssignmentsByUser(id),
          fetch('/api/positions').then(res => res.json())
        ]);

        if (empData) {
          setEmployee(empData);
          setFormData({
            ...empData,
            user: { ...empData.user }
          });
          setLessons(lessonData);
          setAssignments(assignData);
          if (Array.isArray(posData)) setPositions(posData);
        } else {
          router.push('/dashboard/hr/employees');
        }
      } catch (err) {
        console.error('Error fetching employee profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('user.')) {
      const userField = name.split('.')[1];
      setFormData((prev: any) => ({
        ...prev,
        user: { ...prev.user!, [userField]: value }
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || typeof id !== 'string') return;
    
    setSaving(true);
    try {
      const updates = {
        ...formData,
        firstName: formData.user?.firstName,
        lastName: formData.user?.lastName
      };
      const success = await employeeService.updateEmployee(id, updates);
      if (success) {
        const updated = await employeeService.getProfileByUserId(id);
        setEmployee(updated);
        setIsEditing(false);
        showToast('Profile updated successfully', 'success');
      }
    } catch (err) {
      showToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ color: 'white', textAlign: 'center', padding: '5rem' }}>Loading employee profile...</div>;
  if (!employee) return null;

  const getAssignmentForLesson = (lessonId: string) => {
    return assignments.find(a => a.lessonId === lessonId);
  };

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <Link href="/dashboard/hr/employees" className={styles.viewLink} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={16} /> {t('backToCandidates') || 'Back to Employees'}
          </Link>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                padding: '0.6rem 1.2rem',
                background: 'linear-gradient(135deg, #4F46E5, #8B5CF6)',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Edit2 size={16} /> {t('edit')}
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className={styles.formContainer} style={{ background: 'rgba(255, 255, 255, 0.05)', maxWidth: '900px', margin: '2rem auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 className={styles.formTitle}>{t('edit')} {t('profile')}</h2>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setIsEditing(false)} className={styles.viewLink} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <XIcon size={20} /> {t('cancel')}
                </button>
                <button type="submit" disabled={saving} className={styles.submitBtn} style={{ marginTop: 0, padding: '0.6rem 2rem', width: 'auto' }}>
                  {saving ? '...' : <><Check size={20} style={{ marginRight: '0.5rem' }} /> {t('save')}</>}
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>{t('firstName')}</label>
                <input className={styles.input} name="user.firstName" value={formData.user?.firstName || ''} onChange={handleInputChange} required />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>{t('lastName')}</label>
                <input className={styles.input} name="user.lastName" value={formData.user?.lastName || ''} onChange={handleInputChange} required />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>{t('position')}</label>
                <select 
                  className={styles.input} 
                  name="positionId" 
                  value={formData.positionId || ''} 
                  onChange={handleInputChange} 
                  required
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}
                >
                  <option value="">Select position…</option>
                  {positions.map(pos => (
                    <option key={pos.id} value={pos.id} style={{ background: '#1e1b4b' }}>{pos.title}</option>
                  ))}
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>{t('department')}</label>
                <input className={styles.input} name="department" value={formData.department || ''} onChange={handleInputChange} required />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>{t('probation')}</label>
                <input className={styles.input} type="date" name="probationEnd" value={formData.probationEnd || ''} onChange={handleInputChange} />
              </div>
            </div>
          </form>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
            {/* Left Column - User Info */}
            <div className={styles.formContainer} style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '2rem', height: 'fit-content' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, #8EC5FC 0%, #E0C3FC 100%)', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: 'var(--text-primary)', fontWeight: 800 }}>
                  {employee.user.firstName[0]}{employee.user.lastName[0]}
                </div>
                <h1 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                  {employee.user.firstName} {employee.user.lastName}
                </h1>
                <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  {(employee as any).positionRef?.title || employee.position || 'No Position'}
                </div>
              </div>

              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                  <Mail size={18} />
                  <span style={{ wordBreak: 'break-all' }}>{employee.user.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                  <Briefcase size={18} />
                  <span>{employee.department}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                  <Calendar size={18} />
                  <span>Joined: {new Date(employee.joinedAt).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                  <Clock size={18} />
                  <span>Probation ends: {employee.probationEnd ? new Date(employee.probationEnd).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Right Column - Learning History */}
            <div className={styles.formContainer} style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ color: 'white', fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <BookOpen size={24} color="#8EC5FC" />
                  {t('learningProgress')}
                </h2>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select 
                    id="lessonSelect"
                    className={styles.input} 
                    style={{ width: 'auto', minWidth: '200px', height: '40px', background: 'rgba(255,255,255,0.05)', color: 'white', padding: '0 1rem' }}
                  >
                    <option value="" style={{ background: '#1e1b4b' }}>-- {t('assignLesson')} --</option>
                    {lessons
                      .filter(l => !employee.assignedLessons?.includes(l.id))
                      .map(l => (
                        <option key={l.id} value={l.id} style={{ background: '#1e1b4b' }}>
                          {l.title[language] || l.title['ru']}
                        </option>
                      ))
                    }
                  </select>
                  <button 
                    onClick={async () => {
                      const select = document.getElementById('lessonSelect') as HTMLSelectElement;
                      const lessonId = select.value;
                      if (!lessonId) return;
                      await employeeService.assignLesson(employee.userId, lessonId);
                      const updated = await employeeService.getProfileByUserId(employee.userId);
                      setEmployee(updated);
                      showToast('Lesson assigned successfully', 'success');
                    }}
                    className={styles.submitBtn} 
                    style={{ marginTop: 0, width: 'auto', height: '40px' }}
                  >
                    {t('addNew')}
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {lessons
                  .filter(l => employee.assignedLessons?.includes(l.id))
                  .map((lesson) => {
                  const assignment = getAssignmentForLesson(lesson.id);
                  return (
                    <div 
                      key={lesson.id} 
                      style={{ 
                        padding: '1.5rem', 
                        background: 'rgba(255, 255, 255, 0.03)', 
                        borderRadius: '1rem', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                      }}
                    >
                      <div>
                        <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '0.25rem' }}>{lesson.title[language] || lesson.title['ru']}</h3>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                          {assignment ? (
                            <span style={{ color: assignment.status === 'CHECKED' ? '#4ade80' : '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              {assignment.status === 'CHECKED' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                              {assignment.status}
                            </span>
                          ) : (
                            <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>Not started</span>
                          )}
                          {assignment?.submittedAt && (
                            <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                              {new Date(assignment.submittedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'right' }}>
                        {assignment?.status === 'CHECKED' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#8EC5FC' }}>{assignment.grade}/100</span>
                            <Award size={20} color="#fbbf24" />
                          </div>
                        )}
                        {assignment?.status === 'SUBMITTED' && (
                           <div className={`badge badge-pending`}>Pending Review</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
