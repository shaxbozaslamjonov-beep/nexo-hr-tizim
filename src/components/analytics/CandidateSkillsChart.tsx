import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { BrainCircuit } from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';

const data = [
  { subject: 'Technical', A: 120, B: 110, fullMark: 150 },
  { subject: 'Management', A: 98, B: 130, fullMark: 150 },
  { subject: 'Communication', A: 86, B: 130, fullMark: 150 },
  { subject: 'Strategy', A: 99, B: 100, fullMark: 150 },
  { subject: 'Design', A: 85, B: 90, fullMark: 150 },
  { subject: 'Sales', A: 65, B: 85, fullMark: 150 },
];

export function CandidateSkillsChart() {
  const { t } = useLanguage();

  return (
    <Card className="h-full border-none shadow-md overflow-hidden bg-gradient-to-br from-card to-muted/20">
      <CardHeader className="pb-0">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <div className="p-2 bg-indigo-500/10 rounded-xl transition-colors group-hover:bg-indigo-500/20">
            <BrainCircuit className="h-5 w-5 text-indigo-500" />
          </div>
          {t('skills') || 'Talantlar salohiyati'}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center p-0">
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <defs>
              <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
            <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
            <Radar
              name="Current Pool"
              dataKey="A"
              stroke="#4f46e5"
              strokeWidth={3}
              fill="url(#radarGradient)"
              fillOpacity={0.6}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(4px)' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
