'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Video, 
  MapPin, 
  Phone,
  Save,
  CheckCircle2,
  Sparkles,
  FileText
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { interviewService } from '@/lib/services/interviewService';
import { candidateService } from '@/lib/services/candidateService';
import { Candidate } from '@/types';
import toast from 'react-hot-toast';

function CreateInterviewForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const candidateIdFromUrl = searchParams.get('candidateId') || '';

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    candidateId: candidateIdFromUrl,
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '10:00',
    duration: 60,
    type: 'online' as 'online' | 'offline' | 'phone',
    location: '',
    notes: ''
  });

  useEffect(() => {
    loadCandidates();
  }, []);

  useEffect(() => {
    if (candidateIdFromUrl) {
      setFormData(prev => ({ ...prev, candidateId: candidateIdFromUrl }));
    }
  }, [candidateIdFromUrl]);

  const loadCandidates = async () => {
    try {
      const data = await candidateService.getAllCandidates();
      setCandidates(data);
    } catch (e) {
      console.error('Failed to load candidates', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.candidateId || !formData.scheduledDate) {
      toast.error('Iltimos, nomzod va suhbat sanasini tanlang!');
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
        location: formData.location || (formData.type === 'online' ? 'Google Meet / Zoom link' : 'Bosh ofis'),
        status: 'scheduled',
        notes: formData.notes,
        createdBy: '1'
      });

      toast.success('Suhbat muvaffaqiyatli belgilandi!');
      router.push('/dashboard/hr/interviews');
    } catch (error) {
      console.error('Interview creation failed', error);
      toast.error('Suhbatni saqlashda xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      
      {/* Top Back Button + Hero Header Banner */}
      <div>
        <button 
          type="button"
          onClick={() => router.back()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.25rem',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            background: 'white',
            fontSize: '0.85rem',
            fontWeight: 800,
            color: '#334155',
            cursor: 'pointer',
            marginBottom: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            transition: 'all 0.2s'
          }}
        >
          <ArrowLeft size={18} />
          <span>Ortga qaytish</span>
        </button>

        <div style={{
          background: 'linear-gradient(135deg, #0d1b3d 0%, #1f3480 50%, #2e4ba8 100%)',
          borderRadius: '24px',
          padding: '2.5rem 3rem',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(13, 27, 61, 0.15)'
        }}>
          <div style={{
            position: 'absolute',
            top: '-30%',
            right: '-10%',
            width: '350px',
            height: '350px',
            background: 'rgba(65, 105, 201, 0.3)',
            borderRadius: '50%',
            filter: 'blur(80px)',
            pointerEvents: 'none'
          }} />
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.85rem', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, color: '#93c5fd', marginBottom: '0.75rem' }}>
            <Sparkles size={14} />
            INTERVIEW SCHEDULER
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.03em', color: 'white', margin: '0 0 0.5rem 0' }}>
            Yangi Suhbat Belgilash
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)', margin: 0, maxWidth: '600px' }}>
            Nomzod bilan suhbat vaqtini rejalashtiring, suhbat turini va izohlarni kiriting.
          </p>
        </div>
      </div>

      {/* Main Form Card */}
      <div style={{
        background: 'white',
        borderRadius: '28px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 25px rgba(0, 0, 0, 0.04)',
        padding: '2.5rem'
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {/* Row 1: Candidate & Duration */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={16} color="#2563eb" />
                Nomzodni Tanlash *
              </label>
              <select 
                required
                value={formData.candidateId}
                onChange={(e) => setFormData({ ...formData, candidateId: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.85rem 1.1rem',
                  borderRadius: '14px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  outline: 'none'
                }}
              >
                <option value="">-- Nomzodni tanlang --</option>
                {candidates.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} ({c.vacancyTitle || 'Nomzod'})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={16} color="#2563eb" />
                Suhbat Davomiyligi (daqiqa) *
              </label>
              <select 
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '0.85rem 1.1rem',
                  borderRadius: '14px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  outline: 'none'
                }}
              >
                <option value={15}>15 daqiqa</option>
                <option value={30}>30 daqiqa</option>
                <option value={45}>45 daqiqa</option>
                <option value={60}>60 daqiqa (1 soat)</option>
                <option value={90}>90 daqiqa (1.5 soat)</option>
                <option value={120}>120 daqiqa (2 soat)</option>
              </select>
            </div>
          </div>

          {/* Row 2: Date & Time */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={16} color="#2563eb" />
                Suhbat Sanasi *
              </label>
              <input 
                type="date" 
                required
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.85rem 1.1rem',
                  borderRadius: '14px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={16} color="#2563eb" />
                Suhbat Vaqti *
              </label>
              <input 
                type="time" 
                required
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.85rem 1.1rem',
                  borderRadius: '14px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Row 3: Interview Type Switcher Pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Suhbat Turi (Format) *
            </label>
            <div style={{ display: 'flex', gap: '0.75rem', background: '#f1f5f9', padding: '0.4rem', borderRadius: '16px' }}>
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, type: 'online' })}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: formData.type === 'online' ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : 'transparent',
                  color: formData.type === 'online' ? 'white' : '#64748b',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: formData.type === 'online' ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <Video size={18} /> Online Video (Zoom/Meet)
              </button>

              <button 
                type="button"
                onClick={() => setFormData({ ...formData, type: 'offline' })}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: formData.type === 'offline' ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : 'transparent',
                  color: formData.type === 'offline' ? 'white' : '#64748b',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: formData.type === 'offline' ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <MapPin size={18} /> Offline (Ofisda)
              </button>

              <button 
                type="button"
                onClick={() => setFormData({ ...formData, type: 'phone' })}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: formData.type === 'phone' ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : 'transparent',
                  color: formData.type === 'phone' ? 'white' : '#64748b',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: formData.type === 'phone' ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <Phone size={18} /> Telefon Oqili
              </button>
            </div>
          </div>

          {/* Row 4: Location / Meeting Link */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {formData.type === 'online' ? <Video size={16} color="#2563eb" /> : formData.type === 'offline' ? <MapPin size={16} color="#2563eb" /> : <Phone size={16} color="#2563eb" />}
              {formData.type === 'online' ? 'Video Havola (Zoom / Google Meet URL)' : formData.type === 'offline' ? 'Ofis Manzili / Xona Nomeri' : 'Telefon Raqami'}
            </label>
            <input 
              type="text" 
              placeholder={formData.type === 'online' ? 'https://meet.google.com/abc-defg-hij' : formData.type === 'offline' ? 'Toshkent, Asaka ko\'chasi 15-uy, 3-qavat 302-xona' : '+998 90 123 45 67'}
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              style={{
                width: '100%',
                padding: '0.85rem 1.1rem',
                borderRadius: '14px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#0f172a',
                outline: 'none'
              }}
            />
          </div>

          {/* Row 5: Notes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={16} color="#2563eb" />
              Suhbat bo'yicha qo'shimcha izohlar
            </label>
            <textarea 
              rows={4}
              placeholder="Intervyuer uchun ichki eslatmalar..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              style={{
                width: '100%',
                padding: '0.85rem 1.1rem',
                borderRadius: '14px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#0f172a',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Submit Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
            <button 
              type="button"
              onClick={() => router.back()}
              style={{
                padding: '0.75rem 1.75rem',
                background: 'white',
                color: '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Bekor qilish
            </button>
            <button 
              type="submit"
              disabled={submitting}
              style={{
                padding: '0.75rem 2rem',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}
            >
              <CheckCircle2 size={20} />
              {submitting ? 'Saqlanmoqda...' : 'Suhbatni Belgilash'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}

export default function CreateInterviewPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #cbd5e1', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    }>
      <CreateInterviewForm />
    </Suspense>
  );
}
