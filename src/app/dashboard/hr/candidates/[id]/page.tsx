'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { candidateService } from '@/lib/services/candidateService';
import { applicationService } from '@/lib/services/applicationService';
import { interviewService } from '@/lib/services/interviewService';
import { reserveService } from '@/lib/services/reserveService';
import { Candidate, Application, Interview, ReserveCandidate } from '@/types';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar, 
  Briefcase, 
  User as UserIcon,
  MessageSquare,
  Edit2,
  Check,
  X as XIcon,
  MapPin,
  Clock,
  ChevronRight,
  ShieldCheck,
  History,
  FolderHeart,
  Send,
  Plus,
  FileText,
  CheckCircle2,
  XCircle,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './candidate-detail.module.css';

const STATUS_OPTIONS = ['SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED', 'HIRED'];

export default function CandidateDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [reserveInfo, setReserveInfo] = useState<ReserveCandidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'interviews' | 'documents' | 'reserve'>('info');
  const [saving, setSaving] = useState(false);
  const [msgModal, setMsgModal] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!id || typeof id !== 'string') return;
      setLoading(true);
      
      try {
        const cData = await candidateService.getCandidateById(id);
        if (cData) {
          setCandidate(cData);
          
          // Fetch related data
          if (cData.applicationIds && cData.applicationIds.length > 0) {
            const app = await applicationService.getApplicationById(cData.applicationIds[0]);
            setApplication(app);
          }
          
          const intvs = await interviewService.getInterviewsByCandidate(id);
          setInterviews(intvs || []);
          
          const reserveList = await reserveService.getReserveList();
          const rInfo = reserveList.find(r => r.candidateId === id);
          setReserveInfo(rInfo || null);
        } else {
          router.push('/dashboard/hr/candidates');
        }
      } catch (err) {
        console.error('Error fetching candidate details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!candidate) return;
    setSaving(true);
    try {
      const updated = await candidateService.updateCandidate(candidate.id, { status: newStatus as any });
      if (updated) {
        setCandidate(updated);
        showToast('Status updated successfully', 'success');
      }
    } catch (err) {
      showToast('Failed to update status', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddToReserve = async () => {
    if (!candidate) return;
    try {
      await reserveService.addToReserve({
        candidateId: candidate.id,
        candidateName: `${candidate.firstName} ${candidate.lastName}`,
        vacancyTitle: candidate.vacancyTitle,
        source: 'manual',
        notes: 'Added from profile',
        status: 'active',
        addedBy: user?.email || 'System'
      });
      showToast('Added to reserve pool', 'success');
      const reserveList = await reserveService.getReserveList();
      const rInfo = reserveList.find(r => r.candidateId === candidate.id);
      setReserveInfo(rInfo || null);
    } catch (err) {
      showToast('Failed to add to reserve', 'error');
    }
  };

  const handleSendMessage = () => {
    showToast(t('candidatesModule.messageModal.success'), 'success');
    setMsgModal(false);
    setMessage('');
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '1rem' }}>
       <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ width: '40px', height: '40px', border: '4px solid rgba(99, 102, 241, 0.2)', borderTopColor: '#6366f1', borderRadius: '50%' }} />
       <p style={{ color: 'var(--text-light)', fontWeight: 600 }}>{t('loading')}</p>
    </div>
  );
  
  if (!candidate) return null;

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <Link href="/dashboard/hr/candidates" className={styles.backBtn}>
          <ArrowLeft size={18} />
          {t('backToCandidates')}
        </Link>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <Link 
            href={`/dashboard/hr/candidates/${candidate.id}/edit`} 
            className={`${styles.actionBtn}`} 
            style={{ width: 'auto', background: 'white' }}
           >
              <Edit2 size={16} />
              {t('edit')}
           </Link>
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* Left Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.profileCard}>
            <div className={styles.profileDecor} />
            <div className={styles.avatarContainer}>
              <div className={styles.avatarLarge}>
                {candidate.firstName[0]}{candidate.lastName[0]}
              </div>
            </div>
            <h1 className={styles.nameLarge}>{candidate.firstName} {candidate.lastName}</h1>
            <div className={`badge badge-${candidate.status.toLowerCase()}`} style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
              {candidate.status}
            </div>

            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <Mail size={16} className={styles.contactIcon} />
                <span>{candidate.email}</span>
              </div>
              <div className={styles.contactItem}>
                <Phone size={16} className={styles.contactIcon} />
                <span>{candidate.phone || t('applications.form.phone')}</span>
              </div>
              <div className={styles.contactItem}>
                <Briefcase size={16} className={styles.contactIcon} />
                <span>{candidate.vacancyTitle}</span>
              </div>
              <div className={styles.contactItem}>
                <Clock size={16} className={styles.contactIcon} />
                <span>Applied: {new Date(candidate.appliedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className={styles.statusPanel}>
            <div className={styles.statusHeader}>
              <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{t('changeStatus')}</span>
              {saving && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: '12px', height: '12px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} />}
            </div>
            <div style={{ position: 'relative' }}>
              <select 
                className={styles.statusSelect}
                value={candidate.status}
                onChange={(e) => handleUpdateStatus(e.target.value)}
                disabled={saving || (user?.role !== 'ADMIN' && user?.role !== 'HR_MANAGER')}
              >
                {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.quickActions}>
            <button className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} onClick={() => router.push(`/dashboard/hr/interviews/create?candidateId=${candidate.id}`)}>
              <Calendar size={18} />
              {t('candidatesModule.profile.scheduleInterview')}
            </button>
            <button className={styles.actionBtn} onClick={() => setMsgModal(true)}>
              <MessageSquare size={18} />
              {t('candidatesModule.sendMessage')}
            </button>
            {!reserveInfo && (
              <button className={styles.actionBtn} onClick={handleAddToReserve}>
                <FolderHeart size={18} />
                {t('reserve.addToReserve')}
              </button>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className={styles.contentArea}>
          <div className={styles.tabs}>
            {(['info', 'interviews', 'documents', 'reserve'] as const).map(tab => (
              <button 
                key={tab}
                className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {t(`candidatesModule.profile.${tab}`)}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'info' && (
              <motion.div 
                key="info"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={styles.infoSection}
              >
                <h3 className={styles.sectionTitle}>
                  <UserIcon size={22} color="var(--primary)" />
                  {t('candidatesModule.profile.personalInfo')}
                </h3>
                <div className={styles.infoGrid}>
                  <InfoField label={t('firstName')} value={candidate.firstName} />
                  <InfoField label={t('lastName')} value={candidate.lastName} />
                  <InfoField label={t('email')} value={candidate.email} />
                  <InfoField label={t('phone')} value={candidate.phone || '-'} />
                  {application && (
                    <>
                      <InfoField label={t('applications.form.dob')} value={application.dateOfBirth || '-'} />
                      <InfoField label={t('applications.form.address')} value={application.address || '-'} />
                    </>
                  )}
                </div>

                <div style={{ margin: '3rem 0', height: '1px', background: '#f1f5f9' }} />

                <h3 className={styles.sectionTitle}>
                  <Briefcase size={22} color="#8b5cf6" />
                  {t('candidatesModule.profile.professionalInfo')}
                </h3>
                <div className={styles.infoGrid}>
                  <InfoField label={t('position')} value={candidate.vacancyTitle} />
                  <InfoField label={t('stage')} value={candidate.stage} />
                  <InfoField 
                    label={t('experience')} 
                    value={candidate.experience || (application?.totalExperienceMonths ? `${application.totalExperienceMonths} months` : '-')} 
                    fullWidth 
                  />
                  <InfoField label={t('education')} value={candidate.education || application?.educationLevel || '-'} fullWidth />
                  {application && (
                    <>
                      <InfoField label={t('applications.form.computerSkills')} value={application.computerSkills} />
                      <InfoField label={t('applications.form.manufacturingExp')} value={application.manufacturingExperience ? 'Yes' : 'No'} />
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'interviews' && (
              <motion.div 
                key="interviews"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={styles.infoSection}
              >
                <h3 className={styles.sectionTitle}>
                  <History size={22} color="#3b82f6" />
                  {t('candidatesModule.profile.interviews')}
                </h3>
                
                {interviews.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-light)' }}>
                    <Calendar size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <p>{t('candidatesModule.profile.noInterviews')}</p>
                    <button 
                      className="btn-glass" 
                      style={{ marginTop: '1.5rem' }} 
                      onClick={() => router.push(`/dashboard/hr/interviews/create?candidateId=${candidate.id}`)}
                    >
                      <Plus size={16} /> {t('interviews.schedule')}
                    </button>
                  </div>
                ) : (
                  <div className={styles.timeline}>
                    {interviews.map((intv) => (
                      <div key={intv.id} className={styles.timelineItem}>
                        <div className={styles.timelineDot} />
                        <div className={styles.timelineContent}>
                          <div className={styles.timelineHeader}>
                             <div className={styles.timelineTitle}>
                                {t(`interviews.type.${intv.type}`)} - {intv.vacancyTitle}
                             </div>
                             <div className={styles.timelineTime}>
                                {new Date(intv.scheduledDate).toLocaleString()}
                             </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                             <span className={`badge badge-${intv.status.replace('-', '')}`}>{t(`interviews.status.${intv.status.replace('-', '')}`)}</span>
                             {intv.result && <span className={`badge badge-${intv.result}`}>{t(`interviews.result.${intv.result}`)}</span>}
                          </div>
                          {intv.feedback && (
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', background: 'rgba(0,0,0,0.02)', padding: '0.75rem', borderRadius: '8px' }}>
                              "{intv.feedback}"
                            </p>
                          )}
                          <Link 
                            href={`/dashboard/hr/interviews/${intv.id}`} 
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, marginTop: '1rem', textDecoration: 'none' }}
                          >
                            {t('viewProfile')} <ArrowRight size={14} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'documents' && (
              <motion.div 
                key="documents"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={styles.infoSection}
              >
                 <h3 className={styles.sectionTitle}>
                  <ShieldCheck size={22} color="#10b981" />
                  {t('candidatesModule.profile.documentsCheck')}
                </h3>
                
                {!application ? (
                   <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '2rem' }}>No document information available for manual candidate</p>
                ) : (
                  <div className={styles.docList}>
                     <DocItem label={t('applications.form.passport')} checked={application.documents.passport} />
                     <DocItem label={t('applications.form.diploma')} checked={application.documents.diploma} />
                     <DocItem label={t('applications.form.medical')} checked={application.documents.medicalClearance} />
                     <DocItem label={t('applications.form.workBook')} checked={application.documents.workRecord} />
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'reserve' && (
              <motion.div 
                key="reserve"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={styles.infoSection}
              >
                 <h3 className={styles.sectionTitle}>
                  <FolderHeart size={22} color="#f43f5e" />
                  {t('candidatesModule.profile.reserve')}
                </h3>

                {reserveInfo ? (
                   <div style={{ background: 'rgba(244, 63, 94, 0.05)', border: '1px solid rgba(244, 63, 94, 0.2)', padding: '2rem', borderRadius: '20px', textAlign: 'center' }}>
                      <CheckCircle2 size={48} color="#f43f5e" style={{ margin: '0 auto 1.5rem' }} />
                      <h4 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>{t('candidatesModule.profile.inReserve')}</h4>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                         Candidate added on {new Date(reserveInfo.addedAt).toLocaleDateString()} by {reserveInfo.addedBy}
                      </p>
                      <div className={`badge badge-${reserveInfo.status}`} style={{ fontWeight: 800 }}>
                        {t(`reserve.status.${reserveInfo.status}`)}
                      </div>
                      <button 
                        className="btn-glass" 
                        style={{ marginTop: '2rem', display: 'block', margin: '2rem auto 0' }}
                        onClick={() => router.push('/dashboard/hr/reserve')}
                      >
                         Go to Reserve Pool
                      </button>
                   </div>
                ) : (
                   <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '2px dashed #f1f5f9', borderRadius: '24px' }}>
                      <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>This candidate is not in the reserve pool.</p>
                      <button className={styles.actionBtnPrimary} style={{ margin: '0 auto', width: 'auto' }} onClick={handleAddToReserve}>
                         <Plus size={18} /> {t('reserve.addToReserve')}
                      </button>
                   </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Message Modal */}
      <AnimatePresence>
        {msgModal && (
          <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.7)', zIndex: 1000 }}>
             <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="card-glass"
              style={{ width: '450px', padding: '2.5rem', borderRadius: '24px' }}
             >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontWeight: 800 }}>{t('candidatesModule.messageModal.title')}</h3>
                  <button className="icon-btn" onClick={() => setMsgModal(false)}>
                    <XIcon size={20} />
                  </button>
                </div>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                   <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.75rem' }}>
                    {candidate.firstName[0]}{candidate.lastName[0]}
                   </div>
                   <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>To: {candidate.firstName} {candidate.lastName}</div>
                </div>
                <textarea 
                  className="input-premium"
                  placeholder={t('candidatesModule.messageModal.placeholder')}
                  style={{ height: '180px', marginBottom: '1.5rem', background: 'white' }}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <div style={{ display: 'flex', gap: '1rem' }}>
                   <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setMsgModal(false)}>
                      {t('cancel')}
                   </button>
                   <button className="btn-primary" style={{ flex: 1 }} onClick={handleSendMessage} disabled={!message.trim()}>
                      <Send size={18} />
                      {t('candidatesModule.messageModal.send')}
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InfoField({ label, value, fullWidth = false }: { label: string; value: string; fullWidth?: boolean }) {
  return (
    <div className={styles.infoField} style={{ gridColumn: fullWidth ? 'span 2' : 'span 1' }}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={styles.fieldValue}>{value}</span>
    </div>
  );
}

function DocItem({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div className={styles.docItem}>
      <span className={styles.docLabel}>{label}</span>
      {checked ? (
        <div className={styles.checkCircle}>
          <CheckCircle2 size={16} />
        </div>
      ) : (
        <div className={styles.xCircle}>
          <XCircle size={16} />
        </div>
      )}
    </div>
  );
}
