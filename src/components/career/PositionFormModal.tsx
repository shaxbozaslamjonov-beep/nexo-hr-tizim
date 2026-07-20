'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import toast from 'react-hot-toast';

interface PositionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: any;
  title: string;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem',
  borderRadius: '8px',
  border: '1px solid var(--border)',
  outline: 'none',
  fontFamily: 'inherit',
  fontSize: '0.9rem',
  background: 'var(--background)',
  transition: 'border-color 0.2s',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.75rem',
  fontWeight: 700,
  color: 'var(--text-secondary)',
  marginBottom: '0.4rem',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

export function PositionFormModal({ isOpen, onClose, onSave, initialData, title }: PositionFormModalProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    title: '',
    grade: 1,
    department: '',
    requiredSkills: '',
    nextPositions: '',
    status: 'active',
    isCritical: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        grade: initialData.grade || 1,
        department: initialData.department || '',
        requiredSkills: Array.isArray(initialData.requiredSkills) 
          ? initialData.requiredSkills.join(', ') 
          : initialData.requiredSkills || '',
        nextPositions: Array.isArray(initialData.nextPositions)
          ? initialData.nextPositions.join(', ')
          : initialData.nextPositions || '',
        status: initialData.status || 'active',
        isCritical: !!initialData.isCritical,
      });
    } else {
      setFormData({
        title: '',
        grade: 1,
        department: '',
        requiredSkills: '',
        nextPositions: '',
        status: 'active',
        isCritical: false,
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Prepare data for API (convert strings back to arrays if needed by API)
      const dataToSave = {
        ...formData,
        requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()).filter(s => s),
        nextPositions: formData.nextPositions.split(',').map(s => s.trim()).filter(s => s),
      };
      await onSave(dataToSave);
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(t('common.error') || 'Hatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(15, 23, 42, 0.4)',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            style={{
              position: 'relative',
              background: 'var(--surface)',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{title}</h2>
              <button 
                onClick={onClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={labelStyle}>{t('careerMaps.positionCard.title') || 'Lavozim nomi'}</label>
                  <input
                    required
                    style={inputStyle}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Masalan: Senior Backend Developer"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>{t('careerMaps.positionCard.grade') || 'Daraja'}</label>
                    <input
                      required
                      type="number"
                      min="1"
                      style={inputStyle}
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>{t('careerMaps.positionCard.department') || 'Bo‘lim'}</label>
                    <input
                      required
                      style={inputStyle}
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="Masalan: IT"
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>{t('careerMaps.positionCard.requiredSkills') || 'Kerakli ko‘nikmalar'}</label>
                  <textarea
                    style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                    value={formData.requiredSkills}
                    onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                    placeholder="Ko‘nikmalarni vergul bilan ajrating..."
                  />
                </div>

                <div>
                  <label style={labelStyle}>{t('careerMaps.positionCard.status') || 'Holati'}</label>
                  <select
                    style={inputStyle}
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Faol</option>
                    <option value="completed">Tugallangan</option>
                    <option value="highPotential">Istiqbolli</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '8px', background: '#f0f9ff', border: '1px solid #bae6fd' }}>
                  <input
                    type="checkbox"
                    id="isCritical"
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    checked={formData.isCritical}
                    onChange={(e) => setFormData({ ...formData, isCritical: e.target.checked })}
                  />
                  <label htmlFor="isCritical" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0369a1', cursor: 'pointer' }}>
                    KRITIK LAVOZIM (SUCCESSION PLANNING UCHUN)
                  </label>
                </div>

                <div>
                  <label style={labelStyle}>{t('careerMaps.positionCard.nextPositions') || 'Keyingi bosqichlar'}</label>
                  <input
                    style={inputStyle}
                    value={formData.nextPositions}
                    onChange={(e) => setFormData({ ...formData, nextPositions: e.target.value })}
                    placeholder="Keyingi lavozimlarni vergul bilan ajrating..."
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '0.6rem 1.25rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                  }}
                >
                  {t('common.cancel') || 'Bekor qilish'}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.6rem 1.5rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'var(--primary, #6366f1)',
                    color: 'white',
                    fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '0.85rem',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  <Save size={16} />
                  {loading ? (t('common.saving') || 'Saqlanmoqda...') : (t('common.save') || 'Saqlash')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
