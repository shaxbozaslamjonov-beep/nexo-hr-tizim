'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  MoreHorizontal, 
  Plus, 
  Calendar,
  User,
  BookOpen,
  ArrowRight,
  Target,
  Trophy,
  Activity,
  X,
  UserPlus
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function DevelopmentPlanBoard() {
  const { t } = useLanguage();
  const [plans, setPlans] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    employeeId: '',
    objectives: '',
    startDate: new Date().toISOString().split('T')[0],
    mentorId: '',
    actionItems: [] as {task: string, status: string}[],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansRes, empRes] = await Promise.all([
        fetch('/api/development-plans'),
        fetch('/api/employees')
      ]);
      setPlans(await plansRes.json());
      setEmployees(await empRes.json());
    } catch (error) {
      toast.error('Failed to load development data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/development-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success('Development plan created');
        fetchData();
        setIsModalOpen(false);
      } else {
        toast.error('Failed to create plan');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20';
      case 'active': return 'bg-primary text-white shadow-lg shadow-primary/20';
      case 'overdue': return 'bg-rose-500 text-white shadow-lg shadow-rose-500/20';
      default: return 'bg-slate-500 text-white';
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
        <div className="max-w-2xl space-y-3">
          <div className="flex items-center gap-2 text-indigo-600 font-black uppercase text-[10px] tracking-[0.2em]">
            <Trophy size={16} />
            Professional Growth Tracks
          </div>
          <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-none">{t('careerMaps.developmentPlan')}</h3>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">{t('careerMaps.subtitle')}</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="h-14 flex-1 lg:flex-none rounded-2xl flex items-center justify-center gap-4 font-black transition-all"
        >
          <UserPlus size={20} />
          {t('careerMaps.addSkill')}
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {[1,2,3,4].map(i => <div key={i} className="h-96 bg-slate-50 rounded-[4rem] animate-pulse border border-slate-100/50" />)}
        </div>
      ) : plans.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-40 bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-900/[0.02] relative overflow-hidden text-center"
        >
          <div className="absolute top-0 right-0 p-20 opacity-[0.02]">
            <BookOpen size={300} className="text-primary" />
          </div>
          <div className="w-28 h-28 rounded-[2.5rem] bg-indigo-50 text-indigo-400 flex items-center justify-center mb-10 border border-indigo-100/30">
            <BookOpen size={48} />
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">{t('careerMaps.noPaths')}</h3>
          <p className="text-slate-400 font-bold max-w-sm leading-relaxed italic opacity-80 select-none">
            "No active development tracks found. Start building strategic growth plans to accelerate professional mastery and leadership readiness."
          </p>
          <Button 
            onClick={() => setIsModalOpen(true)}
            variant="ghost" 
            className="mt-10 px-10 py-5 rounded-2xl text-primary font-black uppercase tracking-widest text-xs hover:bg-primary/5"
          >
            Create Your First Track
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {plans.map((plan, idx) => {
            const progress = Math.round(((plan.actionItems?.filter((i: any) => i.status === 'completed').length || 0) / (plan.actionItems?.length || 1)) * 100);
            return (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={plan.id}
                className="bg-white border border-slate-200/60 rounded-[4rem] p-12 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-2xl hover:shadow-primary/5 transition-all duration-700 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-125 transition-transform duration-1000">
                  <Trophy size={180} className="text-primary" />
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-10">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100/50 flex items-center justify-center text-xl font-black text-slate-400 group-hover:text-primary transition-colors">
                        {plan.employee?.firstName?.[0]}{plan.employee?.lastName?.[0]}
                      </div>
                      <div>
                        <div className="text-xl font-extrabold text-slate-900 leading-tight tracking-tight">
                          {plan.employee?.firstName} {plan.employee?.lastName}
                        </div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{plan.employee?.position}</div>
                      </div>
                    </div>
                    <div className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest ${getStatusBadge(plan.status)}`}>
                      {plan.status}
                    </div>
                  </div>

                  <h4 className="text-2xl font-black text-slate-900 mb-8 leading-tight group-hover:text-primary transition-colors min-h-[4.5rem]">
                    {plan.objectives}
                  </h4>

                  <div className="grid grid-cols-2 gap-6 mb-10">
                    <div className="bg-slate-50/50 p-6 rounded-[2.5rem] border border-slate-100/50 flex items-center gap-5 group/stat hover:bg-white transition-colors">
                      <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-primary group-hover/stat:rotate-12 transition-transform">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Timeline</div>
                        <div className="text-sm font-black text-slate-700">{new Date(plan.startDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="bg-slate-50/50 p-6 rounded-[2.5rem] border border-slate-100/50 flex items-center gap-5 group/stat hover:bg-white transition-colors">
                      <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 group-hover/stat:-rotate-12 transition-transform">
                        <Target size={20} />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{t('careerMaps.milestone')}</div>
                        <div className="text-sm font-black text-slate-700">{plan.actionItems?.length || 0} Tracks</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-12">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 mb-1">
                      <span>Mastery Level</span>
                      <span className="text-slate-900">{progress}%</span>
                    </div>
                    <div className="h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-primary rounded-full group-hover:shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-shadow"
                      />
                    </div>
                  </div>

                  <Button 
                    variant="ghost" 
                    className="w-full h-20 group/btn flex items-center justify-center gap-4 font-black rounded-3xl bg-slate-50 hover:bg-slate-900 hover:text-white transition-all duration-700"
                  >
                    <Activity size={22} className="text-primary group-hover:text-white transition-colors" />
                    <span>{t('careerMaps.analyzeReadiness')}</span>
                    <ArrowRight size={22} className="group-hover/btn:translate-x-3 transition-transform" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Creation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="bg-white rounded-[3rem] p-12 w-full max-w-2xl shadow-2xl border border-slate-200"
            >
              <div className="flex justify-between items-start mb-10">
                <div className="flex items-center gap-5">
                  <div className="p-5 bg-primary/10 text-primary rounded-[1.5rem]">
                    <Plus size={32} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t('careerMaps.createPosition')}</h2>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">{t('careerMaps.subtitle')}</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreatePlan} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Employee</label>
                    <select 
                      required 
                      className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-200 font-black text-slate-700 outline-none"
                      value={formData.employeeId}
                      onChange={e => setFormData({...formData, employeeId: e.target.value})}
                    >
                      <option value="">{t('employees')}...</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                    <Input 
                      type="date"
                      required
                      className="!h-14 rounded-2xl bg-slate-50 border-slate-200 font-black"
                      value={formData.startDate}
                      onChange={e => setFormData({...formData, startDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Core Objectives</label>
                  <textarea 
                    required
                    className="w-full h-24 p-6 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-slate-700 outline-none"
                    placeholder="E.g., Transition to Senior Architect roles within 12 months..."
                    value={formData.objectives}
                    onChange={e => setFormData({...formData, objectives: e.target.value})}
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <Button type="button" variant="ghost" className="flex-1 !h-14 rounded-2xl font-black text-slate-400" onClick={() => setIsModalOpen(false)}>
                    Discard
                  </Button>
                  <Button type="submit" className="flex-1 !h-14 rounded-2xl font-black shadow-xl shadow-primary/30">
                    {t('careerMaps.savePosition')}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
