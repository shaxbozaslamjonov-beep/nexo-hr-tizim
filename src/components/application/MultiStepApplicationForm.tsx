'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Briefcase, 
  FileText, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft,
  Mail,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  Computer,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { applicationService } from '@/lib/services/applicationService';
import { vacancyService } from '@/lib/services/vacancyService';
import { Vacancy } from '@/types';
import { toast } from 'react-hot-toast';

interface MultiStepApplicationFormProps {
  vacancyId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function MultiStepApplicationForm({ vacancyId, onSuccess, onCancel }: MultiStepApplicationFormProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [formData, setFormData] = useState({
    vacancyId: vacancyId || '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    source: 'Company Website',
    educationLevel: 'high_school',
    totalExperienceMonths: 0,
    computerSkills: 'basic',
    availableForShifts: false,
    manufacturingExperience: false,
    documents: {
      passport: false,
      diploma: false,
      medicalClearance: false,
      workRecord: false,
    }
  });

  useEffect(() => {
    const fetchVacancies = async () => {
      if (!vacancyId) {
        try {
          const data = await vacancyService.getVacancies();
          setVacancies(data);
        } catch (error) {
          console.error('Failed to fetch vacancies:', error);
        }
      }
    };
    fetchVacancies();
  }, [vacancyId]);

  const handleNext = () => {
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || (!vacancyId && !formData.vacancyId)) {
        toast.error('Please fill required fields');
        return;
      }
    }
    setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    try {
      const selectedVacancy = vacancies.find(v => v.id === formData.vacancyId) || 
                             (vacancyId ? await vacancyService.getVacancyById(vacancyId) : null);
      
      await applicationService.createApplication({
        ...formData,
        vacancyTitle: selectedVacancy?.title || 'General Application'
      });
      
      toast.success(t('applications.form.success'));
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error('Error submitting application');
    }
  };

  const steps = [
    { id: 1, title: t('applications.form.step1'), icon: User },
    { id: 2, title: t('applications.form.step2'), icon: Briefcase },
    { id: 3, title: t('applications.form.step3'), icon: FileText },
    { id: 4, title: t('applications.form.step4'), icon: CheckCircle },
  ];

  return (
    <div style={{ background: 'var(--surface)', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', maxWidth: '800px', margin: '0 auto' }}>
      {/* Step Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '15px', left: '0', right: '0', height: '2px', background: 'var(--border)', zIndex: 0 }} />
        <div style={{ position: 'absolute', top: '15px', left: '0', width: `${((step - 1) / (steps.length - 1)) * 100}%`, height: '2px', background: 'var(--primary)', zIndex: 0, transition: 'width 0.3s ease' }} />
        
        {steps.map((s) => {
          const Icon = s.icon;
          const isActive = step >= s.id;
          const isCurrent = step === s.id;
          return (
            <div key={s.id} style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                background: isActive ? 'var(--primary)' : 'white', 
                border: `2px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
                color: isActive ? 'white' : 'var(--text-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                transition: 'all 0.3s'
              }}>
                {isActive && step > s.id ? '✓' : s.id}
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isCurrent ? 'var(--primary)' : 'var(--text-light)', textAlign: 'center' }}>{s.title}</span>
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {step === 1 && (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {!vacancyId && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={labelStyle}>{t('vacancy')} *</label>
                  <select 
                    value={formData.vacancyId} 
                    onChange={e => setFormData({...formData, vacancyId: e.target.value})}
                    style={inputStyle}
                  >
                    <option value="">Select vacancy...</option>
                    {vacancies.map(v => <option key={v.id} value={v.id}>{v.title} ({v.department})</option>)}
                  </select>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>{t('applications.form.firstName')} *</label>
                  <input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} style={inputStyle} />
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>{t('applications.form.lastName')} *</label>
                  <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>{t('applications.form.email')} *</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={inputStyle} />
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>{t('applications.form.phone')}</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={inputStyle} />
                </div>
              </div>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>{t('applications.form.dob')}</label>
                <input type="date" value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} style={inputStyle} />
              </div>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>{t('applications.form.address')}</label>
                <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} style={{...inputStyle, height: '80px', resize: 'none'}} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>{t('applications.form.educationLevel')}</label>
                <select value={formData.educationLevel} onChange={e => setFormData({...formData, educationLevel: e.target.value})} style={inputStyle}>
                  <option value="high_school">High School</option>
                  <option value="bachelor">Bachelor's Degree</option>
                  <option value="master">Master's Degree</option>
                  <option value="phd">PhD</option>
                </select>
              </div>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>{t('applications.form.totalExperience')}</label>
                <input type="number" min="0" value={formData.totalExperienceMonths} onChange={e => setFormData({...formData, totalExperienceMonths: parseInt(e.target.value)})} style={inputStyle} />
              </div>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>{t('applications.form.computerSkills')}</label>
                <select value={formData.computerSkills} onChange={e => setFormData({...formData, computerSkills: e.target.value})} style={inputStyle}>
                  <option value="basic">Basic (Office, Web)</option>
                  <option value="intermediate">Intermediate (Advanced tools)</option>
                  <option value="advanced">Advanced (Proficient)</option>
                </select>
              </div>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.availableForShifts} onChange={e => setFormData({...formData, availableForShifts: e.target.checked})} style={checkboxStyle} />
                  <span style={{ fontSize: '0.9rem' }}>{t('applications.form.shiftWork')}</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.manufacturingExperience} onChange={e => setFormData({...formData, manufacturingExperience: e.target.checked})} style={checkboxStyle} />
                  <span style={{ fontSize: '0.9rem' }}>{t('applications.form.manufacturingExp')}</span>
                </label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{t('applications.form.documents')}</h3>
              <div style={{ display: 'grid', gap: '1rem', padding: '1.5rem', background: 'var(--background)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                {(['passport', 'diploma', 'medicalClearance', 'workRecord'] as const).map(doc => (
                  <label key={doc} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={formData.documents[doc]} 
                      onChange={e => setFormData({ ...formData, documents: { ...formData.documents, [doc]: e.target.checked }})} 
                      style={checkboxStyle} 
                    />
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{t(`applications.form.${doc === 'medicalClearance' ? 'medical' : doc === 'workRecord' ? 'workBook' : doc}`)}</span>
                  </label>
                ))}
              </div>
              <div style={{ marginTop: '1rem', padding: '1rem', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fef3c7', display: 'flex', gap: '0.75rem' }}>
                <AlertCircle size={20} color="#d97706" />
                <label style={{ cursor: 'pointer' }}>
                  <input type="checkbox" style={{ marginRight: '8px' }} required />
                  <span style={{ fontSize: '0.85rem', color: '#92400e' }}>{t('applications.form.consent')}</span>
                </label>
              </div>
            </div>
          )}

          {step === 4 && (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{t('applications.form.summary')}</h3>
                <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Please review your details before submitting</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', padding: '1.5rem', background: 'var(--background)', borderRadius: '16px' }}>
                <div>
                  <p style={summaryLabelStyle}>{t('applications.form.firstName')} & {t('applications.form.lastName')}</p>
                  <p style={summaryValueStyle}>{formData.firstName} {formData.lastName}</p>
                  
                  <p style={summaryLabelStyle}>{t('applications.form.email')}</p>
                  <p style={summaryValueStyle}>{formData.email}</p>
                </div>
                <div>
                  <p style={summaryLabelStyle}>{t('applications.form.educationLevel')}</p>
                  <p style={summaryValueStyle}>{formData.educationLevel}</p>
                  
                  <p style={summaryLabelStyle}>{t('applications.form.totalExperience')}</p>
                  <p style={summaryValueStyle}>{formData.totalExperienceMonths} months</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
        {step > 1 ? (
          <button onClick={handleBack} style={secondaryButtonStyle}>
            <ChevronLeft size={18} /> {t('applications.form.back')}
          </button>
        ) : (
          <button onClick={onCancel} style={secondaryButtonStyle}>{t('cancel')}</button>
        )}

        {step < 4 ? (
          <button onClick={handleNext} style={primaryButtonStyle}>
            {t('applications.form.next')} <ChevronRight size={18} />
          </button>
        ) : (
          <button onClick={handleSubmit} style={primaryButtonStyle}>
            {t('applications.form.submit')}
          </button>
        )}
      </div>
    </div>
  );
}

const inputGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem'
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  fontWeight: 700,
  color: 'var(--text-secondary)'
};

const inputStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  borderRadius: '12px',
  border: '1px solid var(--border)',
  background: 'var(--background)',
  fontSize: '0.95rem',
  outline: 'none',
  width: '100%'
};

const checkboxStyle: React.CSSProperties = {
  width: '18px',
  height: '18px',
  accentColor: 'var(--primary)',
  cursor: 'pointer'
};

const primaryButtonStyle: React.CSSProperties = {
  padding: '0.75rem 2rem',
  borderRadius: '12px',
  background: 'var(--grad-primary)',
  color: 'white',
  fontWeight: 700,
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: '0.75rem 2rem',
  borderRadius: '12px',
  background: 'var(--surface)',
  color: 'var(--text-secondary)',
  fontWeight: 700,
  border: '1px solid var(--border)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem'
};

const summaryLabelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--text-light)',
  textTransform: 'uppercase',
  fontWeight: 700,
  marginBottom: '0.25rem',
  marginTop: '1rem'
};

const summaryValueStyle: React.CSSProperties = {
  fontWeight: 600,
  color: 'var(--text-primary)'
};
