'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { vacancyService } from '@/lib/services/vacancyService';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { can } from '@/lib/rbac';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Save, Briefcase, MapPin, DollarSign, List, AlignLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CreateVacancyPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: 'Tashkent',
    description: '',
    requirements: '',
    salary: '',
    salaryMin: '',
    salaryMax: '',
    shift: 'day' as const,
    status: 'OPEN' as const,
    positionId: '',
  });

  const [positions, setPositions] = useState<{ id: string, title: string, department?: string, description?: string, requirements?: string }[]>([]);

  useState(() => {
    fetch('/api/positions')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPositions(data);
      });
  });

  // Admin check
  const isAdmin = can(user, 'manage_vacancies');

  if (!isAdmin && user) {
    router.push('/dashboard/hr/vacancies');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await vacancyService.createVacancy({
        ...formData,
        salaryMin: formData.salaryMin ? Number(formData.salaryMin) : undefined,
        salaryMax: formData.salaryMax ? Number(formData.salaryMax) : undefined,
        createdBy: user?.id || 'system',
      });
      toast.success(t('vacancies.created'));
      router.push('/dashboard/hr/vacancies');
      router.refresh();
    } catch (error) {
      toast.error(t('vacancies.createError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <Link
        href="/dashboard/hr/vacancies"
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          color: 'var(--text-secondary)', 
          marginBottom: '2rem',
          fontWeight: 600
        }}
        className="hover-lift"
      >
        <ArrowLeft size={20} />
        {t('backToCandidates') || 'Back'}
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          background: 'var(--surface)', 
          borderRadius: '24px', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          padding: '2.5rem',
          border: '1px solid var(--border)'
        }}
      >
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            {t('vacancies.createNew')}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Fill in the details to publish a new job opening</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Position Link */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Linked Position (from Career Maps)
              </label>
              <select
                value={formData.positionId}
                onChange={(e) => {
                  const posId = e.target.value;
                  const pos = positions.find(p => p.id === posId);
                  setFormData({ 
                    ...formData, 
                    positionId: posId,
                    title: pos ? pos.title : formData.title,
                    department: pos?.department || formData.department,
                    description: pos?.description || formData.description,
                  });
                }}
                style={inputStyleNoIcon}
              >
                <option value="">-- Select central position --</option>
                {positions.map(pos => (
                  <option key={pos.id} value={pos.id}>{pos.title}</option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                {t('vacancies.form.title')} *
              </label>
              <div style={{ position: 'relative' }}>
                <Briefcase size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Frontend Developer"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Department */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                {t('vacancies.form.department')} *
              </label>
              <div style={{ position: 'relative' }}>
                <AlignLeft size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Engineering"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Location */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                {t('vacancies.form.location')} *
              </label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Salary Range */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Min Salary (UZS)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 5000000"
                  value={formData.salaryMin}
                  onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                  style={inputStyleNoIcon}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Max Salary (UZS)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 10000000"
                  value={formData.salaryMax}
                  onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                  style={inputStyleNoIcon}
                />
              </div>
            </div>

            {/* Shift */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Work Shift *
              </label>
              <select
                required
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value as any })}
                style={inputStyleNoIcon}
              >
                <option value="day">Kunduzgi (Day)</option>
                <option value="night">Tungi (Night)</option>
                <option value="flex">Moslashuvchan (Flex)</option>
              </select>
            </div>
          </div>

          {/* Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              {t('vacancies.form.status')} *
            </label>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {(['OPEN', 'PENDING', 'CLOSED'] as const).map((status) => (
                <label key={status} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={formData.status === status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                  />
                  <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {t(`vacancies.status.${status}`)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              {t('vacancies.form.description')} *
            </label>
            <textarea
              required
              rows={5}
              placeholder="Describe the role, responsibilities, and team..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={textareaStyle}
            />
          </div>

          {/* Requirements */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              {t('vacancies.form.requirements')} *
            </label>
            <textarea
              required
              rows={5}
              placeholder="List requirements, skills, and experience needed..."
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              style={textareaStyle}
            />
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Link href="/dashboard/hr/vacancies" style={{ textDecoration: 'none' }}>
              <button
                type="button"
                style={{
                  padding: '0.85rem 2rem',
                  borderRadius: '14px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text-secondary)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                className="hover-lift"
              >
                {t('cancel')}
              </button>
            </Link>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.85rem 2.5rem',
                borderRadius: '14px',
                border: 'none',
                background: 'var(--grad-primary)',
                color: 'white',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: '0 10px 20px rgba(99, 102, 241, 0.2)'
              }}
              className="hover-lift"
            >
              {loading ? (
                <span>{t('loading')}</span>
              ) : (
                <>
                  <Save size={20} />
                  {t('save')}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.85rem 1rem 0.85rem 2.75rem',
  borderRadius: '14px',
  border: '1px solid var(--border)',
  background: 'var(--background)',
  fontSize: '0.95rem',
  fontWeight: 500,
  outline: 'none',
  transition: 'all 0.2s',
  color: 'var(--text-primary)'
};

const inputStyleNoIcon: React.CSSProperties = {
  ...inputStyle,
  paddingLeft: '1rem'
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  padding: '1rem',
  borderRadius: '14px',
  border: '1px solid var(--border)',
  background: 'var(--background)',
  fontSize: '0.95rem',
  fontWeight: 500,
  outline: 'none',
  transition: 'all 0.2s',
  color: 'var(--text-primary)',
  resize: 'vertical',
  minHeight: '120px'
};
