import React from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Activity } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

interface EmployeeDynamicsChartProps {
  data: {
    month: string;
    hires: number;
    left: number;
  }[];
}

export function EmployeeDynamicsChart({ data }: EmployeeDynamicsChartProps) {
  const { t } = useLanguage();

  const formattedData = data;
  const totalHires = formattedData.reduce((sum, d) => sum + d.hires, 0);
  const totalLeft = formattedData.reduce((sum, d) => sum + d.left, 0);
  const netGrowth = totalHires - totalLeft;

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
      <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)' }}>
            <Activity size={22} color="white" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0d1b3d', margin: 0, lineHeight: 1.2 }}>
              {t('careerMaps.stats.monthlyGrowth') || 'Ежемесячный рост'}
            </h3>
            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0.25rem 0 0 0' }}>
              Staffing Trends over time
            </p>
          </div>
        </div>
        <div style={{ padding: '0.35rem 0.75rem', borderRadius: '20px', background: netGrowth >= 0 ? '#dcfce7' : '#fee2e2', color: netGrowth >= 0 ? '#15803d' : '#b91c1c', fontSize: '0.75rem', fontWeight: 900 }}>
          Net {netGrowth >= 0 ? '+' : ''}{netGrowth}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '300px' }}>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={formattedData}
            margin={{ top: 20, right: 20, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorHires" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorLeft" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.6} />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} 
            />
            <Tooltip 
              contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)', backgroundColor: 'white', padding: '12px' }}
              itemStyle={{ fontSize: '13px', fontWeight: 800 }}
              labelStyle={{ color: '#0d1b3d', marginBottom: '8px', fontWeight: 900, fontSize: '14px' }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 800, paddingBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}/>
            <Area 
              type="monotone" 
              dataKey="hires" 
              name={t('analytics.employeeDynamics.hired') || 'Qabul qilingan'} 
              stroke="#4f46e5" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorHires)" 
              activeDot={{ r: 6, fill: '#4f46e5' }}
            />
            <Area 
              type="monotone" 
              dataKey="left" 
              name={t('analytics.employeeDynamics.left') || 'Ketgan'} 
              stroke="#ec4899" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorLeft)" 
              activeDot={{ r: 6, fill: '#ec4899' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
