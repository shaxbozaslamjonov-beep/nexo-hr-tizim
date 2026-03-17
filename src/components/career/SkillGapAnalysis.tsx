'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  ChevronDown, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpCircle,
  TrendingUp,
  Brain,
  Target,
  User,
  Layout,
  Star
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function SkillGapAnalysis() {
  const { t } = useLanguage();
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<any>(null);
  const [gapData, setGapData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [empRes, posRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/positions')
      ]);
      setEmployees(await empRes.json());
      setPositions(await posRes.json());
    } catch (error) {
      toast.error('Failed to load data');
    }
  };

  const calculateGap = async () => {
    if (!selectedEmployee || !selectedPosition) return;
    setLoading(true);
    try {
      const res = await fetch('/api/readiness/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmployee.id,
          targetPositionId: selectedPosition.id
        })
      });
      const data = await res.json();
      setGapData(data);
    } catch (error) {
      toast.error('Calculation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Configuration Hub */}
      <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-2xl shadow-slate-900/[0.02] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
          <Activity size={180} className="text-primary" />
        </div>
        
        <div className="relative z-10 flex flex-col xl:flex-row items-end gap-10">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 ml-1">
                <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <User size={14} />
                </div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">{t('employees')}</label>
              </div>
              <div className="relative">
                <select 
                  className="w-full h-16 px-6 bg-slate-50/50 border border-slate-200/60 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 hover:border-primary/30 transition-all cursor-pointer font-bold text-slate-700 appearance-none pr-12"
                  value={selectedEmployee?.id || ''}
                  onChange={(e) => {
                    const emp = employees.find(emp => emp.id === e.target.value);
                    setSelectedEmployee(emp);
                    setGapData(null);
                  }}
                >
                  <option value="">{t('searchByName')}</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2.5 ml-1">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                  <Layout size={14} />
                </div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">{t('careerMaps.targetPosition')}</label>
              </div>
              <div className="relative">
                <select 
                  className="w-full h-16 px-6 bg-slate-50/50 border border-slate-200/60 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 hover:border-primary/30 transition-all cursor-pointer font-bold text-slate-700 appearance-none pr-12"
                  value={selectedPosition?.id || ''}
                  onChange={(e) => {
                    const pos = positions.find(pos => pos.id === e.target.value);
                    setSelectedPosition(pos);
                    setGapData(null);
                  }}
                >
                  <option value="">{t('position')}</option>
                  {positions.map(pos => (
                    <option key={pos.id} value={pos.id}>{pos.title}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
              </div>
            </div>
          </div>

          <Button 
            onClick={calculateGap}
            disabled={loading || !selectedEmployee || !selectedPosition}
            className="w-full xl:w-auto h-14 px-12 rounded-2xl flex items-center justify-center gap-4 font-black transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <TrendingUp size={20} strokeWidth={3} />
                {t('careerMaps.analyzeReadiness')}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Analysis Results */}
      <AnimatePresence>
        {gapData && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="space-y-12"
          >
            {/* Main Score Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-slate-900 rounded-[3.5rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                  <div className="relative w-48 h-48 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/10" />
                      <motion.circle 
                        initial={{ strokeDashoffset: 552.92 }}
                        animate={{ strokeDashoffset: 552.92 - (552.92 * gapData.overallMatch) / 100 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" 
                        className="text-primary"
                        strokeDasharray={552.92}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-black">{gapData.overallMatch}%</span>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">{t('careerMaps.matchScore')}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-6 text-center md:text-left">
                    <div className="space-y-1">
                      <h2 className="text-4xl font-extrabold tracking-tight">
                        {selectedEmployee?.firstName} {selectedEmployee?.lastName}
                      </h2>
                      <p className="text-primary font-bold text-lg">Target: {selectedPosition?.title}</p>
                    </div>
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                      <span className="text-sm font-black uppercase tracking-widest">{gapData.readiness}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200/60 rounded-[3.5rem] p-12 flex flex-col items-center justify-center text-center space-y-6 group hover:shadow-2xl hover:shadow-primary/5 transition-all">
                <div className="w-20 h-20 rounded-[2rem] bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <Brain size={32} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">{t('careerMaps.gapIdentified')}</h3>
                  <p className="text-sm text-slate-400 font-bold max-w-[180px]">Strategic focus areas for target readiness.</p>
                </div>
                <Button variant="ghost" className="text-primary font-black uppercase text-[10px] tracking-[0.2em] hover:bg-primary/5">
                  View Development Steps
                </Button>
              </div>
            </div>

            {/* Component Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Object.entries(gapData.components || {}).map(([key, value]: [string, any], idx) => (
                <motion.div 
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white border border-slate-100 rounded-[2.5rem] p-8 hover:shadow-xl transition-all group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1">
                      <h4 className="text-lg font-extrabold text-slate-800 tracking-tight capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Assessment Area</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary">
                      {idx === 0 ? <Brain size={18} /> : idx === 1 ? <Target size={18} /> : idx === 2 ? <Star size={18} /> : <Activity size={18} />}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${value * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                        className="h-full bg-primary rounded-full group-hover:shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-shadow"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] px-1">
                      <span>Score</span>
                      <span className="text-slate-900">{Math.round(value * 100)}%</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Detailed Skill Matrix */}
            <div className="bg-white border border-slate-200/60 rounded-[3.5rem] p-12 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <div className="flex justify-between items-center mb-12">
                <div className="space-y-1">
                  <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-4">
                    {t('careerMaps.skillMatrix')}
                  </h3>
                  <p className="text-slate-400 font-bold text-sm tracking-tight">Granular breakdown of competency gaps.</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200" /> {t('careerMaps.targetPosition')}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase text-primary tracking-widest">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" /> Current
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="text-left py-6 px-8 rounded-l-2xl text-[11px] font-black text-slate-400 uppercase tracking-widest">Competency</th>
                      <th className="text-center py-6 px-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Readiness Level</th>
                      <th className="text-center py-6 px-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="text-right py-6 px-8 rounded-r-2xl text-[11px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {(gapData.skillDetails || []).map((skill: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/30 transition-colors group">
                        <td className="py-8 px-8">
                          <div className="font-extrabold text-slate-800 text-lg group-hover:text-primary transition-colors">{skill.name}</div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Technical Skill</div>
                        </td>
                        <td className="py-8 px-4">
                          <div className="flex flex-col items-center gap-2">
                            <div className="flex gap-1.5">
                              {[1,2,3,4,5].map(i => (
                                <div 
                                  key={i} 
                                  className={`w-4 h-4 rounded-full transition-all duration-500 ${i <= skill.current ? 'bg-primary scale-110 shadow-lg shadow-primary/20' : i <= skill.required ? 'bg-slate-200' : 'bg-slate-100'}`} 
                                />
                              ))}
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase">{skill.current}/{skill.required} Required</span>
                          </div>
                        </td>
                        <td className="py-8 px-4 text-center">
                          {skill.current >= skill.required ? (
                            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-emerald-100">
                              <CheckCircle2 size={12} /> {t('careerMaps.targetMet')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-rose-50 text-rose-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-rose-100">
                              <AlertCircle size={12} /> {t('careerMaps.gapIdentified')}
                            </span>
                          )}
                        </td>
                        <td className="py-8 px-8 text-right">
                          <Button variant="ghost" className="text-[10px] font-black uppercase text-primary tracking-[0.2em] hover:bg-primary/5 h-10 px-6 rounded-xl">
                            Find Courses <ArrowUpCircle size={14} className="ml-2 rotate-45" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
