'use client';

import React from 'react';
import Link from 'next/link';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  Legend
} from 'recharts';
import { Filter, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface VacancyStatusChartProps {
  data: {
    name: string;
    value: number;
  }[];
}

const COLORS = ['#10b981', '#f59e0b', '#64748b']; // Green (Open), Amber (Pending), Slate (Closed)

export function VacancyStatusChart({ data }: VacancyStatusChartProps) {
  const { t } = useLanguage();

  const baseData = data;
  const hasData = baseData.some((d) => d.value > 0);

  const localizedNames: Record<string, string> = {
    'Open': t('analytics.vacancyStatus.open') || 'Ochiq',
    'Pending': t('analytics.vacancyStatus.pending') || 'Kutilmoqda',
    'Closed': t('analytics.vacancyStatus.closed') || 'Yopiq'
  };

  const formattedData = baseData.map(item => ({
    ...item,
    localName: localizedNames[item.name] || item.name
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '0.85rem' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0d1b3d', textTransform: 'uppercase', margin: '0 0 0.25rem 0' }}>{payload[0].payload.localName}</p>
          <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#2563eb' }}>
            {payload[0].value} ta vakansiya
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '24px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '420px',
    }}>
      {/* Header */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)' }}>
          <Filter size={22} color="white" />
        </div>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0d1b3d', margin: 0, lineHeight: 1.2 }}>
            {t('analytics.vacancyStatus.title') || 'Статус вакансий'}
          </h3>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0.25rem 0 0 0' }}>
            Current Distribution
          </p>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '260px' }}>
        {!hasData ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>
            {t('analytics.noData') || 'Vakansiya holatlari mavjud emas'}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={formattedData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={6}
                dataKey="value"
                nameKey="localName"
                stroke="none"
                cornerRadius={10}
              >
                {formattedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={32} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer Button */}
      <div style={{ padding: '1rem 1.5rem 1.5rem 1.5rem', borderTop: '1px solid #f1f5f9' }}>
        <Link href="/dashboard/hr/vacancies" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', fontSize: '0.85rem', fontWeight: 800, color: '#334155', textDecoration: 'none' }}>
          {t('vacancies.viewApplications') || "Batafsil ko'rish"}
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
