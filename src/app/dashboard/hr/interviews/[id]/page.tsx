'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Video, 
  MapPin, 
  Phone,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageCircle,
  Star,
  Plus,
  Save
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { interviewService } from '@/lib/services/interviewService';
import { candidateService } from '@/lib/services/candidateService';
import { reserveService } from '@/lib/services/reserveService';
import { Interview, Candidate } from '@/types';
import toast from 'react-hot-toast';
import styles from '../interviews.module.css';

export default function InterviewDetailPage() {
  const { id } = useParams() as { id: string };
  const { t, language } = useLanguage();
  const router = useRouter();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [evaluation, setEvaluation] = useState({
    result: 'passed' as 'passed' | 'failed' | 'pending',
    feedback: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const interviewData = await interviewService.getInterviewById(id);
      if (interviewData) {
        setInterview(interviewData);
        setEvaluation({
          result: (interviewData.result as any) || 'passed',
          feedback: (interviewData as any).feedback || '',
          notes: interviewData.notes || ''
        });
        const candidateData = await candidateService.getCandidateById(interviewData.candidateId);
        setCandidate(candidateData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: Interview['status']) => {
    if (!interview) return;
    setUpdating(true);
    try {
      await interviewService.updateInterview(id, { status });
      setInterview({ ...interview, status });
      toast.success('Status updated');
    } catch (e) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveEvaluation = async () => {
    if (!interview) return;
    setUpdating(true);
    try {
      await interviewService.updateInterview(id, { 
        ...evaluation, 
        status: 'completed' 
      });
      setInterview({ ...interview, ...evaluation, status: 'completed' });
      toast.success('Evaluation saved');
    } catch (e) {
      toast.error('Failed to save evaluation');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddToReserve = async () => {
    if (!candidate) return;
    try {
      await reserveService.addToReserve({
        candidateId: candidate.id,
        candidateName: `${candidate.firstName} ${candidate.lastName}`,
        vacancyTitle: candidate.vacancyTitle,
        source: 'interview',
        notes: evaluation.feedback || 'Added from interview evaluation',
        status: 'active',
        addedBy: 'Admin'
      });
      toast.success(t('reserve.addToReserve') + ' success');
    } catch (e) {
      toast.error('Failed to add to reserve');
    }
  };

  if (loading) return <div className="p-8 text-center">{t('loading')}</div>;
  if (!interview) return <div className="p-8 text-center">Interview not found</div>;

  return (
    <div className={styles.pageContainer}>
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => router.back()}
          className="btn-icon"
          style={{ marginBottom: '1rem' }}
        >
          <ArrowLeft size={20} />
          <span>{t('back')}</span>
        </button>
        <h1 className={styles.title} style={{ color: 'var(--text-primary)' }}>Interview Details</h1>
      </div>

      <div className="grid-3">
        {/* Left Column: Info Card */}
        <div style={{ gridColumn: 'span 1' }}>
          <div className="card-glass" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
             <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
               <div className="avatar-large" style={{ margin: '0 auto 1rem' }}>
                 {interview.candidateName?.[0]}
               </div>
               <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{interview.candidateName}</h2>
               <p style={{ color: 'var(--text-light)', margin: '0.25rem 0' }}>{interview.vacancyTitle}</p>
               <span className={`badge badge-${interview.status}`} style={{ marginTop: '0.5rem' }}>
                 {t(`interviews.status.${interview.status}`)}
               </span>
             </div>

             <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '1.5rem' }}>
                <div className={styles.infoItem} style={{ marginBottom: '1rem' }}>
                  <Calendar size={18} color="var(--primary)" />
                  <span>{new Date(interview.scheduledDate).toLocaleDateString(language === 'uz' ? 'uz-UZ' : 'ru-RU')}</span>
                </div>
                <div className={styles.infoItem} style={{ marginBottom: '1rem' }}>
                  <Clock size={18} color="var(--primary)" />
                  <span>{new Date(interview.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({interview.duration} min)</span>
                </div>
                <div className={styles.infoItem} style={{ marginBottom: '1rem' }}>
                  {interview.type === 'online' ? <Video size={18} /> : interview.type === 'phone' ? <Phone size={18} /> : <MapPin size={18} />}
                  <span>{interview.location || t(`interviews.type.${interview.type}`)}</span>
                </div>
             </div>

             <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
               {interview.status === 'scheduled' && (
                 <>
                   <button className="btn-primary" onClick={() => handleUpdateStatus('completed')}>
                     Mark as Completed
                   </button>
                   <button className="btn-secondary" onClick={() => handleUpdateStatus('cancelled')}>
                     Cancel Interview
                   </button>
                 </>
               )}
               {candidate && (
                 <button className="btn-glass" onClick={() => router.push(`/dashboard/hr/candidates/${candidate.id}`)}>
                   View Candidate Profile
                 </button>
               )}
             </div>
          </div>
        </div>

        {/* Right Column: Evaluation & Results */}
        <div style={{ gridColumn: 'span 2' }}>
          <div className="card-glass" style={{ padding: '2rem', height: '100%' }}>
            <h2 className={styles.sectionTitle} style={{ marginBottom: '1.5rem' }}>Evaluation & Feedback</h2>
            
            <div className="form-group">
              <label className="form-label">Interview Result</label>
              <div className="tab-switch-compact" style={{ maxWidth: '400px' }}>
                <button 
                  className={`tab-btn-compact ${evaluation.result === 'passed' ? 'active' : ''}`}
                  onClick={() => setEvaluation({ ...evaluation, result: 'passed' })}
                >
                  <CheckCircle2 size={16} /> Passed
                </button>
                <button 
                  className={`tab-btn-compact ${evaluation.result === 'failed' ? 'active' : ''}`}
                  onClick={() => setEvaluation({ ...evaluation, result: 'failed' })}
                >
                  <XCircle size={16} /> Failed
                </button>
                <button 
                  className={`tab-btn-compact ${evaluation.result === 'pending' ? 'active' : ''}`}
                  onClick={() => setEvaluation({ ...evaluation, result: 'pending' })}
                >
                  <AlertCircle size={16} /> Pending
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <MessageCircle size={16} />
                Feedback for Candidate
              </label>
              <textarea 
                className="form-input"
                rows={4}
                placeholder="Write feedback that will be shared with the candidate..."
                value={evaluation.feedback}
                onChange={(e) => setEvaluation({ ...evaluation, feedback: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Star size={16} />
                Internal Interviewer Notes
              </label>
              <textarea 
                className="form-input"
                rows={4}
                placeholder="Notes for internal HR use only..."
                value={evaluation.notes}
                onChange={(e) => setEvaluation({ ...evaluation, notes: e.target.value })}
              />
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
               <button className="btn-glass" onClick={handleAddToReserve}>
                 <Plus size={18} />
                 {t('reserve.addToReserve')}
               </button>
               <button className="btn-primary" onClick={handleSaveEvaluation} disabled={updating}>
                 <Save size={18} />
                 {updating ? 'Saving...' : 'Save Evaluation'}
               </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .tab-switch-compact {
          display: flex;
          background: #f1f5f9;
          padding: 0.25rem;
          border-radius: 10px;
          gap: 0.25rem;
        }
        .tab-btn-compact {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.5rem;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: #64748b;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .tab-btn-compact.active {
          background: white;
          color: var(--primary);
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .avatar-large {
          width: 80px;
          height: 80px;
          background: var(--grad-sidebar);
          color: white;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 800;
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}
