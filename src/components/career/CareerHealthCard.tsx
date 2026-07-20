'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Edit2, Loader2, Calendar, Target, Users, BookOpen } from 'lucide-react';
import { CareerHealthFormModal } from './CareerHealthFormModal';
import toast from 'react-hot-toast';

export function CareerHealthCard() {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/career-health');
      const healthData = await res.json();
      setData(healthData);
    } catch (err) {
      console.error('Fetch health error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (updatedData: any) => {
    try {
      const res = await fetch('/api/career-health', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      if (res.ok) {
        toast.success('Muvaffaqiyatli saqlandi');
        fetchData();
      } else {
        toast.error('Saqlashda hatolik yuz berdi');
      }
    } catch (err) {
      console.error('Save health error:', err);
      toast.error('Tarmoq hatoligi');
    }
  };

  if (loading && !data) {
    return (
      <div style={{ background: 'var(--surface)', borderRadius: '16px', padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', border: '1px solid #f1f5f9' }}>
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const mainMetrics = [
    { label: t('careerMaps.careerHealth.readiness') || 'Tayyorgarlik', value: `${data?.readiness}%`, icon: Target, color: '#6366f1' },
    { label: t('careerMaps.careerHealth.coverage') || 'Qoplama', value: `${data?.coverage}%`, icon: BookOpen, color: '#10b981' },
    { label: t('careerMaps.careerHealth.talentPool') || 'Iste’dodlar zaxirasi', value: data?.talentPool, icon: Users, color: '#f59e0b' },
    { label: t('careerMaps.careerHealth.filledRoles') || 'Toʻldirilgan rollar', value: `${data?.filledRoles}/${data?.totalRoles}`, icon: Calendar, color: '#ec4899' },
  ];

  const readinessLevels = [
    { label: t('careerMaps.careerHealth.readyNow') || 'Hozir tayyor', value: data?.nowReady },
    { label: t('careerMaps.careerHealth.ready6m') || '6 oyda tayyor', value: data?.ready6m },
    { label: t('careerMaps.careerHealth.ready1y') || '1 yilda tayyor', value: data?.ready1y },
  ];

  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: '20px',
      padding: '1.5rem',
      border: '1px solid #f1f5f9',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '10px' }}>
            <Target size={18} color="#6366f1" />
          </div>
          <h2 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
            {t('careerMaps.careerHealth.title') || 'KARYERA HOLATI'}
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--background)', padding: '0.4rem 0.8rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)' }}>HOLAT:</span>
             <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#6366f1' }}>{data?.rating}</span>
          </div>
          {isAdmin && (
            <button 
              onClick={() => setIsEditModalOpen(true)}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '0.4rem',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = '#6366f1'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
            >
              <Edit2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Grid: Main Metrics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {mainMetrics.map((metric, idx) => (
          <div key={idx} style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            padding: '1.5rem',
            borderRadius: '12px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
               <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.01em' }}>
                 {metric.label}
               </span>
               <div style={{ padding: '0.4rem', borderRadius: '8px', background: `${metric.color}10` }}>
                 <metric.icon size={14} color={metric.color} />
               </div>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {metric.value}
            </div>
          </div>
        ))}
      </div>

      {/* Grid: Readiness Levels */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
        gap: '1.5rem',
        background: 'var(--background)',
        padding: '1.5rem',
        borderRadius: '16px',
        border: '1px solid #f1f5f9'
      }}>
        {readinessLevels.map((level, idx) => (
          <div key={idx} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>
              {level.label}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              {level.value}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 500 }}>
          {t('careerMaps.careerHealth.lastUpdated')}: {new Date(data?.lastUpdated).toLocaleDateString()}
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
           <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
           <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase' }}>Live Data</span>
        </div>
      </div>

      <CareerHealthFormModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={data}
        onSave={handleSave}
      />
    </div>
  );
}
