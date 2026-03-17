'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp,
  Brain,
  ShieldAlert,
  Activity,
  ArrowRight,
  Target,
  Sparkles,
  Zap,
  Star,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';

export default function SuccessionMatrix() {
  const { t } = useLanguage();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/employees');
      const data = await res.json();
      setEmployees(data || []);
    } catch (error) {
      console.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const boxes = [
    { id: '3-3', label: t('careerMaps.matrix.star'), color: 'bg-primary/10', border: 'border-primary/30', potential: 'High', performance: 3, icon: Sparkles },
    { id: '3-2', label: t('careerMaps.matrix.futureStar'), color: 'bg-indigo-50/50', border: 'border-indigo-100', potential: 'High', performance: 2, icon: Zap },
    { id: '3-1', label: t('careerMaps.matrix.roughDiamond'), color: 'bg-amber-50/50', border: 'border-amber-100', potential: 'High', performance: 1, icon: Star },
    { id: '2-3', label: t('careerMaps.matrix.highProfessional'), color: 'bg-indigo-50/30', border: 'border-indigo-100/50', potential: 'Medium', performance: 3, icon: Target },
    { id: '2-2', label: t('careerMaps.matrix.corePlayer'), color: 'bg-slate-50/80', border: 'border-slate-200/60', potential: 'Medium', performance: 2, icon: Users },
    { id: '2-1', label: t('careerMaps.matrix.inconsistentPerformer'), color: 'bg-rose-50/30', border: 'border-rose-100/50', potential: 'Medium', performance: 1, icon: Activity },
    { id: '1-3', label: t('careerMaps.matrix.trustedProfessional'), color: 'bg-slate-100/50', border: 'border-slate-200/80', potential: 'Low', performance: 3, icon: ShieldAlert },
    { id: '1-2', label: t('careerMaps.matrix.effectivePerformer'), color: 'bg-slate-50/50', border: 'border-slate-200/40', potential: 'Low', performance: 2, icon: CheckCircle2 },
    { id: '1-1', label: t('careerMaps.matrix.underPerformer'), color: 'bg-rose-100/20', border: 'border-rose-200/30', potential: 'Low', performance: 1, icon: AlertCircle },
  ];

  const getEmployeesInBox = (potential: string, performance: number) => {
    return employees.filter(emp => {
      const pRating = emp.careerProfile?.performanceRating || 0;
      const perfLevel = pRating >= 4.5 ? 3 : pRating >= 3.5 ? 2 : 1;
      const potLevel = emp.careerProfile?.potentialRating || 'Low';
      return potLevel === potential && perfLevel === performance;
    });
  };

  return (
    <div className="space-y-16 pb-20">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10">
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-[0.2em] mb-2">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}>
              <Sparkles size={16} />
            </motion.div>
            Talent Assessment Matrix
          </div>
          <h3 className="text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
            {t('careerMaps.successionMatrix')}
          </h3>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">
            Advanced organizational mapping system to visualize talent density, 
            leadership potential, and strategic succession trajectories across your workforce.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="px-8 py-5 bg-white border border-slate-200/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{t('analytics.title') || 'Analitika'}</div>
              <div className="text-xl font-black text-slate-900 leading-none">{employees.length} {t('employees')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative p-10 lg:p-14 bg-white border border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-900/[0.02] overflow-x-auto">
        <div className="relative min-w-[1000px]">
          {/* Y Axis Label */}
          <div className="absolute -left-12 lg:-left-20 top-1/2 -translate-y-1/2 -rotate-90 flex items-center gap-6 text-slate-300 font-black uppercase text-[10px] tracking-[0.5em] whitespace-nowrap opacity-50">
            <TrendingUp size={16} />
            {t('potential.high')} Capacity
          </div>

          {/* X Axis Label */}
          <div className="absolute -bottom-12 lg:-bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-8 text-slate-300 font-black uppercase text-[10px] tracking-[0.5em] whitespace-nowrap opacity-50">
            Performance Excellence
            <Activity size={16} />
          </div>

          {/* The Matrix Grid */}
          <div className="grid grid-cols-3 gap-8">
            {boxes.map((box, idx) => {
              const matches = getEmployeesInBox(box.potential, box.performance);
              return (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  key={box.id}
                  className={`${box.color} ${box.border} border-2 rounded-[2.5rem] p-8 aspect-square flex flex-col items-center justify-center text-center group hover:bg-white hover:shadow-2xl hover:scale-[1.02] transition-all duration-700 cursor-pointer relative overflow-hidden`}
                >
                  <div className="absolute top-8 left-10 text-[10px] font-black text-slate-300 uppercase tracking-widest">{box.potential[0]}·{box.performance}</div>
                  
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors duration-500 mb-6 shadow-sm">
                    <box.icon size={24} />
                  </div>

                  <h4 className="text-xl font-extrabold text-slate-900 group-hover:text-primary transition-colors tracking-tight mb-8">
                    {box.label}
                  </h4>

                  <div className="flex flex-wrap justify-center gap-3 max-w-[200px]">
                    {loading ? (
                      <div className="w-12 h-12 bg-slate-200/50 rounded-2xl animate-pulse" />
                    ) : matches.length > 0 ? (
                      <div className="flex -space-x-3 overflow-hidden p-2">
                        {matches.slice(0, 4).map(emp => (
                          <div 
                            key={emp.id} 
                            className="w-14 h-14 rounded-[1.2rem] bg-white shadow-xl ring-4 ring-white flex items-center justify-center text-[13px] font-black text-primary hover:-translate-y-3 transition-transform duration-500 hover:z-20 hover:scale-125 relative group/avatar"
                          >
                            {getInitials(emp.firstName, emp.lastName)}
                            <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-4 py-2 rounded-xl opacity-0 group-hover/avatar:opacity-100 pointer-events-none transition-all font-black whitespace-nowrap z-50 shadow-2xl">
                              {emp.firstName} {emp.lastName}
                            </div>
                          </div>
                        ))}
                        {matches.length > 4 && (
                          <div className="w-14 h-14 rounded-[1.2rem] bg-slate-900 text-white text-xs font-black ring-4 ring-white flex items-center justify-center relative translate-x-2">
                            +{matches.length - 4}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic pt-4">No Data Points</div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Strategic Intelligence Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {[
          { 
            title: 'Succession Pipeline', 
            advice: 'Accelerate "Star" internal mobility. Focus on leadership readiness and high-impact stretch assignments.', 
            color: 'bg-primary/5 border-primary/10 text-primary',
            icon: Target 
          },
          { 
            title: 'Technical Stability', 
            advice: 'Solid performers provide the backbone. Invest in advanced certifications and specialized quality programs.', 
            color: 'bg-indigo-50 border-indigo-100 text-indigo-600',
            icon: Brain 
          },
          { 
            title: 'Asset Alignment', 
            advice: 'Reassess role-fit for low performance sectors. Utilize 1-on-1 coaching to bridge critical competency gaps.', 
            color: 'bg-rose-50 border-rose-100 text-rose-600',
            icon: ShieldAlert 
          }
        ].map(card => (
          <div key={card.title} className={`${card.color} border p-8 rounded-[3rem] flex items-start gap-8 hover:shadow-2xl hover:shadow-primary/5 transition-all group relative overflow-hidden`}>
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-1000">
              <card.icon size={80} />
            </div>
            <div className="p-5 rounded-2xl bg-white shadow-xl shadow-slate-900/5 group-hover:-rotate-12 transition-transform duration-500">
              <card.icon size={32} />
            </div>
            <div className="relative z-10">
              <h5 className="text-xl font-extrabold mb-3 text-slate-900 tracking-tight">{card.title}</h5>
              <p className="text-sm font-bold leading-relaxed opacity-70 italic">"{card.advice}"</p>
              <Button variant="ghost" className="mt-8 p-0 h-auto font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-3 hover:bg-transparent group/btn">
                <span>View Full Strategy</span>
                <ArrowRight size={14} className="group-hover/btn:translate-x-2 transition-transform text-primary" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
