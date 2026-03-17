'use client';

import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import toast from 'react-hot-toast';

interface CareerHealthFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: any;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  outline: 'none',
  fontFamily: 'inherit',
  fontSize: '0.9rem',
  background: '#f8fafc',
  transition: 'border-color 0.2s',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.75rem',
  fontWeight: 700,
  color: '#64748b',
  marginBottom: '0.4rem',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

export function CareerHealthFormModal({ isOpen, onClose, onSave, initialData }: CareerHealthFormModalProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    readiness: 74,
    coverage: 65,
    talentPool: 18,
    filledRoles: 4,
    totalRoles: 6,
    nowReady: 12,
    ready6m: 8,
    ready1y: 5,
    rating: 'B+',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        readiness: initialData.readiness || 0,
        coverage: initialData.coverage || 0,
        talentPool: initialData.talentPool || 0,
        filledRoles: initialData.filledRoles || 0,
        totalRoles: initialData.totalRoles || 0,
        nowReady: initialData.nowReady || 0,
        ready6m: initialData.ready6m || 0,
        ready1y: initialData.ready1y || 0,
        rating: initialData.rating || 'B+',
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Saqlashda hatolik yuz berdi');
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

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            style={{
              position: 'relative',
              background: 'white',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                {t('careerMaps.careerHealth.editTitle') || 'Karyera holatini tahrirlash'}
              </h2>
              <button 
                onClick={onClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Main Metrics */}
                <div style={{ gridColumn: 'span 2' }}>
                   <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#6366f1', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                     ASOSIY METRIKALAR
                   </h3>
                </div>

                <div>
                  <label style={labelStyle}>{t('careerMaps.careerHealth.readiness') || 'Tayyorgarlik (%)'}</label>
                  <input
                    required
                    type="number"
                    min="0"
                    max="100"
                    style={inputStyle}
                    value={formData.readiness}
                    onChange={(e) => setFormData({ ...formData, readiness: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <label style={labelStyle}>{t('careerMaps.careerHealth.coverage') || 'Qoplama (%)'}</label>
                  <input
                    required
                    type="number"
                    min="0"
                    max="100"
                    style={inputStyle}
                    value={formData.coverage}
                    onChange={(e) => setFormData({ ...formData, coverage: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <label style={labelStyle}>{t('careerMaps.careerHealth.talentPool') || 'Iste’dodlar zaxirasi'}</label>
                  <input
                    required
                    type="number"
                    min="0"
                    style={inputStyle}
                    value={formData.talentPool}
                    onChange={(e) => setFormData({ ...formData, talentPool: parseInt(e.target.value) })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={labelStyle}>TOʻLD. ROLL.</label>
                    <input
                      required
                      type="number"
                      min="0"
                      style={inputStyle}
                      value={formData.filledRoles}
                      onChange={(e) => setFormData({ ...formData, filledRoles: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>JAMI ROLL.</label>
                    <input
                      required
                      type="number"
                      min="1"
                      style={inputStyle}
                      value={formData.totalRoles}
                      onChange={(e) => setFormData({ ...formData, totalRoles: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                {/* Readiness Levels */}
                <div style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
                   <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#6366f1', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                     TAYYORLIK DARAJALARI
                   </h3>
                </div>

                <div>
                  <label style={labelStyle}>{t('careerMaps.careerHealth.readyNow') || 'Hozir tayyor'}</label>
                  <input
                    required
                    type="number"
                    min="0"
                    style={inputStyle}
                    value={formData.nowReady}
                    onChange={(e) => setFormData({ ...formData, nowReady: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <label style={labelStyle}>{t('careerMaps.careerHealth.ready6m') || '6 oyda tayyor'}</label>
                  <input
                    required
                    type="number"
                    min="0"
                    style={inputStyle}
                    value={formData.ready6m}
                    onChange={(e) => setFormData({ ...formData, ready6m: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <label style={labelStyle}>{t('careerMaps.careerHealth.ready1y') || '1 yilda tayyor'}</label>
                  <input
                    required
                    type="number"
                    min="0"
                    style={inputStyle}
                    value={formData.ready1y}
                    onChange={(e) => setFormData({ ...formData, ready1y: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <label style={labelStyle}>REYTINQ (MASALAN: B+)</label>
                  <input
                    required
                    style={inputStyle}
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '0.6rem 1.25rem',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    background: 'white',
                    color: '#64748b',
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
                  {loading ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
