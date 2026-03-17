'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Briefcase, 
  Video, 
  MapPin, 
  Phone,
  Save,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { interviewService } from '@/lib/services/interviewService';
import { candidateService } from '@/lib/services/candidateService';
import { Candidate } from '@/types';
import toast from 'react-hot-toast';
import styles from '../interviews.module.css';

export default function CreateInterviewPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    candidateId: '',
    scheduledDate: '',
    scheduledTime: '10:00',
    duration: 60,
    type: 'online' as 'online' | 'offline' | 'phone',
    location: '',
    notes: ''
  });

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      const data = await candidateService.getAllCandidates();
      setCandidates(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.candidateId || !formData.scheduledDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const combinedDate = `${formData.scheduledDate}T${formData.scheduledTime}:00`;
      
      await interviewService.createInterview({
        candidateId: formData.candidateId,
        scheduledDate: combinedDate,
        duration: Number(formData.duration),
        type: formData.type,
        location: formData.location,
        status: 'scheduled',
        notes: formData.notes,
        createdBy: '1' // Mock admin ID
      });

      toast.success(t('interviews.created') || 'Interview scheduled successfully');
      router.push('/dashboard/hr/interviews');
    } catch (error) {
      console.error(error);
      toast.error('Failed to schedule interview');
    } finally {
      setSubmitting(false);
    }
  };

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
        <h1 className={styles.title} style={{ color: 'var(--text-primary)' }}>{t('interviews.schedule')}</h1>
      </div>

      <div className="card-glass" style={{ padding: '2.5rem', maxWidth: '800px' }}>
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">
                <User size={16} />
                {t('candidates.title')} *
              </label>
              <select 
                className="form-input"
                required
                value={formData.candidateId}
                onChange={(e) => setFormData({ ...formData, candidateId: e.target.value })}
              >
                <option value="">Select Candidate</option>
                {candidates.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} ({c.vacancyTitle})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Clock size={16} />
                {t('interviews.duration')} *
              </label>
              <select 
                className="form-input"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
              >
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
                <option value={90}>90 min</option>
                <option value={120}>120 min</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">
                <Calendar size={16} />
                Date *
              </label>
              <input 
                type="date" 
                className="form-input"
                required
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Clock size={16} />
                Time *
              </label>
              <input 
                type="time" 
                className="form-input"
                required
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Type *</label>
            <div className="tab-switch-compact">
              <button 
                type="button"
                className={`tab-btn-compact ${formData.type === 'online' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, type: 'online' })}
              >
                <Video size={16} /> Online
              </button>
              <button 
                type="button"
                className={`tab-btn-compact ${formData.type === 'offline' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, type: 'offline' })}
              >
                <MapPin size={16} /> Offline
              </button>
              <button 
                type="button"
                className={`tab-btn-compact ${formData.type === 'phone' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, type: 'phone' })}
              >
                <Phone size={16} /> Phone
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              {formData.type === 'online' ? <Video size={16} /> : formData.type === 'offline' ? <MapPin size={16} /> : <Phone size={16} />}
              {t('interviews.location')}
            </label>
            <input 
              type="text" 
              className="form-input"
              placeholder={formData.type === 'online' ? 'Zoom, Google Meet, etc.' : formData.type === 'offline' ? 'Office address, Room #' : 'Phone number'}
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Save size={16} />
              {t('interviews.notes')}
            </label>
            <textarea 
              className="form-input"
              rows={4}
              placeholder="Internal notes for the interviewer..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => router.back()}
            >
              {t('cancel')}
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={submitting}
            >
              <CheckCircle2 size={20} />
              {submitting ? 'Scheduling...' : t('interviews.schedule')}
            </button>
          </div>
        </form>
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
      `}</style>
    </div>
  );
}
