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
      <div style={{ background: 'var(--surface)', borderRadius: '16px', padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', border: '1px solid var(--border)' }}>
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const mainMetrics = [
    { label: t('careerMaps.careerHealth.readiness') || 'Tayyorgarlik', value: `${data?.readiness}%`, icon: Target, color: 'var(--primary)' },
    { label: t('careerMaps.careerHealth.coverage') || 'Qoplama', value: `${data?.coverage}%`, icon: BookOpen, color: 'var(--emerald-500)' },
    { label: t('careerMaps.careerHealth.talentPool') || 'Iste’dodlar zaxirasi', value: data?.talentPool, icon: Users, color: 'var(--amber-500)' },
    { label: t('careerMaps.careerHealth.filledRoles') || 'Toʻldirilgan rollar', value: `${data?.filledRoles}/${data?.totalRoles}`, icon: Calendar, color: 'var(--turquoise-600)' },
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
      border: '1px solid var(--border)',
      boxShadow: 'var(--card-shadow)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.5rem', background: 'rgba(46, 86, 230, 0.1)', borderRadius: '10px' }}>
            <Target size={18} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
            {t('careerMaps.careerHealth.title') || 'KARYERA HOLATI'}
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--bg-muted)', padding: '0.4rem 0.8rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)' }}>HOLAT:</span>
             <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)' }}>{data?.rating}</span>
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
              onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
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
               <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.01em' }}>
                 {metric.label}
               </span>
               <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'var(--bg-muted)' }}>
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
        background: 'var(--bg-muted)',
        padding: '1.5rem',
        borderRadius: '16px',
        border: '1px solid var(--border)'
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
        <span style={{ fontSize: '0.65rem', color: 'var(--text-light)', fontWeight: 500 }}>
          {t('careerMaps.careerHealth.lastUpdated')}: {new Date(data?.lastUpdated).toLocaleDateString()}
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
           <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--emerald-500)' }} />
           <span style={{ fontSize: '0.65rem', color: 'var(--emerald-500)', fontWeight: 700, textTransform: 'uppercase' }}>Live Data</span>
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
