'use client';

import React from 'react';
import { Edit2, Trash2, Briefcase } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export interface PositionCardProps {
  title: string;
  grade: string;
  department: string;
  requiredSkills: string;
  nextPositions: string;
  readiness: number;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function PositionCard({
  title,
  grade,
  department,
  requiredSkills,
  nextPositions,
  readiness,
  onEdit,
  onDelete
}: PositionCardProps) {
  const { t } = useLanguage();

  const barColor = readiness > 70 ? 'var(--success)' : readiness > 40 ? 'var(--warning)' : 'var(--error)';

  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: '20px',
      padding: '1.5rem',
      border: '1px solid var(--border)',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'default',
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.02)';
      e.currentTarget.style.borderColor = 'var(--blue-100)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)';
      e.currentTarget.style.borderColor = 'var(--border)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
    >
      {/* Header: icon + title + actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', minWidth: 0 }}>
          <div style={{ padding: '0.6rem', borderRadius: '12px', background: 'var(--blue-50)', color: 'var(--primary)', flexShrink: 0, boxShadow: '0 2px 4px rgba(46,86,230,0.08)' }}>
            <Briefcase size={20} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{title}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, background: 'var(--bg-muted)', padding: '0.1rem 0.4rem', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                {t('careerMaps.positionCard.grade')} {grade}
              </span>
              <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--gray-300)' }}></span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{department}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
          <button onClick={onEdit} title={t('careerMaps.positionCard.edit')} style={{ background: 'var(--blue-50)', border: '1px solid var(--blue-100)', borderRadius: '8px', color: 'var(--primary)', cursor: 'pointer', padding: '0.35rem', display: 'flex', alignItems: 'center' }}>
            <Edit2 size={14} />
          </button>
          <button onClick={onDelete} title={t('careerMaps.positionCard.delete')} style={{ background: 'var(--red-50)', border: '1px solid var(--red-100)', borderRadius: '8px', color: 'var(--error)', cursor: 'pointer', padding: '0.35rem', display: 'flex', alignItems: 'center' }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Skills & Next Positions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flexGrow: 1, marginBottom: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>
            {t('careerMaps.positionCard.requiredSkills')}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{requiredSkills}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>
            {t('careerMaps.positionCard.nextPositions')}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{nextPositions}</div>
        </div>
      </div>

      {/* Readiness Progress */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{t('careerMaps.positionCard.readiness')}</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: barColor }}>{readiness}%</span>
        </div>
        <div style={{ height: '6px', background: 'var(--bg-muted)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ width: `${readiness}%`, height: '100%', background: barColor, borderRadius: '3px', transition: 'width 0.4s ease' }} />
        </div>
      </div>
    </div>
  );
}
