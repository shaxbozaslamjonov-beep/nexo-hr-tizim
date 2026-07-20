'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  progress?: number
  progressLabel?: string
  footer?: string
  trend?: { value: string; direction: "up" | "down"; color?: string }
}

export function StatsCard({ title, value, subtitle, progress, progressLabel, footer, trend }: StatsCardProps) {
  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: '16px',
      padding: '1.25rem',
      border: '1px solid #f1f5f9',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'box-shadow 0.2s, border-color 0.2s',
    }}
    onMouseOver={(e) => { e.currentTarget.style.boxShadow = '0 8px 20px -5px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#c7d2fe'; }}
    onMouseOut={(e) => { e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = '#f1f5f9'; }}
    >
      {/* Title row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</span>
        {trend && (
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.2rem',
            padding: '0.15rem 0.5rem',
            borderRadius: '20px',
            background: trend.direction === 'up' ? '#ecfdf5' : '#fef2f2',
            color: trend.direction === 'up' ? '#059669' : '#dc2626',
          }}>
            {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>

      {/* Value */}
      <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, marginBottom: '0.25rem' }}>{value}</div>
      {subtitle && <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500, marginBottom: '0.5rem' }}>{subtitle}</div>}

      {/* Progress */}
      {progress !== undefined && (
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 600, marginBottom: '0.4rem' }}>
            <span style={{ color: '#94a3b8' }}>{progressLabel || 'Progress'}</span>
            <span style={{ color: '#6366f1', fontWeight: 700 }}>{progress}%</span>
          </div>
          <div style={{ height: '6px', background: 'var(--bg-muted)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)', borderRadius: '3px' }} />
          </div>
        </div>
      )}

      {/* Footer */}
      {footer && (
        <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{footer}</span>
        </div>
      )}
    </div>
  )
}
