import React from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { TrendingUp, Users } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';

interface RecruitmentFunnelChartProps {
  data: {
    name: string;
    value: number;
    color?: string;
  }[];
}

const COLORS = {
  'Application': 'url(#colorApp)',
  'Screening': 'url(#colorScr)',
  'Interview': 'url(#colorInt)',
  'Training': 'url(#colorTra)',
  'Hired': 'url(#colorHir)'
};

export function RecruitmentFunnelChart({ data }: RecruitmentFunnelChartProps) {
  const { t } = useLanguage();

  const formattedData = data.map(item => {
    let localName = item.name;
    const stageKey = item.name.toLowerCase() as keyof typeof COLORS;
    const color = COLORS[item.name as keyof typeof COLORS] || 'var(--text-secondary)';
    
    const trans = t(`funnel.stages.${stageKey}`);
    if (trans && trans !== `funnel.stages.${stageKey}`) {
      localName = trans;
    }

    return {
      ...item,
      localName,
      fill: color
    };
  });

  const total = formattedData[0]?.value || 0;
  const hasData = formattedData.some((d) => d.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const rate = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0.0';
      return (
        <div style={{ 
          background: 'var(--surface)', 
          borderRadius: '16px', 
          boxShadow: 'var(--card-shadow)', 
          padding: '1rem', 
          border: '1px solid var(--border)', 
          minWidth: '180px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase' }}>{data.localName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            <span>Nomzodlar:</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 900 }}>{data.value} ta</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.25rem' }}>
            <span>Konversiya:</span>
            <span style={{ fontWeight: 900 }}>{rate}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: '24px',
      border: '1px solid var(--border)',
      boxShadow: 'var(--card-shadow)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '420px',
    }}>
      {/* Header */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(46, 86, 230, 0.25)' }}>
            <Users size={22} color="white" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>
              {t('recruitmentFunnel') || 'Воронка рекрутмента'}
            </h3>
            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0.25rem 0 0 0' }}>
              Process Efficiency
            </p>
          </div>
        </div>
        <div style={{ padding: '0.4rem', borderRadius: '10px', background: 'var(--emerald-50)', display: 'flex' }}>
          <TrendingUp size={18} color="var(--emerald-600)" />
        </div>
      </div>

      {/* Chart Body */}
      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '300px' }}>
        {!hasData ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
            {t('analytics.noData') || 'Ma\'lumotlar mavjud emas'}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={formattedData}
              layout="vertical"
              margin={{ top: 5, right: 40, left: 10, bottom: 5 }}
              barSize={28}
            >
              <defs>
                <linearGradient id="colorApp" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--blue-600)" />
                  <stop offset="100%" stopColor="var(--turquoise-500)" />
                </linearGradient>
                <linearGradient id="colorScr" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--blue-700)" />
                  <stop offset="100%" stopColor="var(--blue-500)" />
                </linearGradient>
                <linearGradient id="colorInt" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--amber-600)" />
                  <stop offset="100%" stopColor="var(--amber-500)" />
                </linearGradient>
                <linearGradient id="colorTra" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--turquoise-600)" />
                  <stop offset="100%" stopColor="var(--turquoise-300)" />
                </linearGradient>
                <linearGradient id="colorHir" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--emerald-600)" />
                  <stop offset="100%" stopColor="var(--emerald-500)" />
                </linearGradient>
              </defs>
              <XAxis type="number" hide />
              <YAxis 
                dataKey="localName" 
                type="category" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 700 }}
                width={120}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
              <Bar dataKey="value" radius={[0, 12, 12, 0]}>
                {formattedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <LabelList dataKey="value" position="right" fill="var(--text-primary)" fontSize={13} fontWeight={900} offset={12} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
