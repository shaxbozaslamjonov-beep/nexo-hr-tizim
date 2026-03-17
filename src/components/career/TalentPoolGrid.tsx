'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Star, 
  TrendingUp, 
  ChevronRight,
  ShieldCheck,
  UserPlus,
  Layout,
  MoreVertical,
  Building2,
  Calendar,
  X
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function TalentPoolGrid() {
  const { t } = useLanguage();
  const [talent, setTalent] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    readiness: 'ready_6m',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [talentRes, empRes] = await Promise.all([
        fetch('/api/talent-pool'),
        fetch('/api/employees')
      ]);
      setTalent(await talentRes.json());
      setEmployees(await empRes.json());
    } catch (error) {
      toast.error('Failed to load talent data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPool = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/talent-pool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          addedBy: 'HR_MANAGER' // Mock for now, should come from auth
        }),
      });

      if (res.ok) {
        toast.success('Added to talent pool');
        fetchData();
        setIsModalOpen(false);
      } else {
        toast.error('Failed to add to pool');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const getReadinessBadge = (readiness: string) => {
    switch (readiness) {
      case 'ready_now': return 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20';
      case 'ready_6m': return 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20';
      case 'ready_1y+': return 'bg-amber-500 text-white shadow-lg shadow-amber-500/20';
      default: return 'bg-slate-500 text-white';
    }
  };

  const filteredTalent = talent.filter(p => {
    const name = `${p.employee?.firstName} ${p.employee?.lastName}`.toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || p.employee?.position?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
        <div className="relative flex-1 w-full group">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
            <Search size={22} />
          </div>
          <Input 
            placeholder={t('candidatesModule.searchCandidates')} 
            className="pl-16 !h-20 rounded-[2.5rem] !bg-white border-slate-200/60 text-lg font-bold focus:shadow-2xl focus:shadow-primary/5 transition-all shadow-sm group-hover:border-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4 w-full lg:w-auto">
          <Button variant="ghost" className="h-20 flex-1 lg:flex-none rounded-[2.5rem] border border-slate-200 bg-white flex items-center justify-center gap-3 font-black text-slate-600 px-10 hover:bg-slate-50 hover:border-slate-300 transition-all">
            <Filter size={20} />
            {t('sidebar.lessonSettings')}
          </Button>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="h-14 flex-1 lg:flex-none rounded-2xl flex items-center justify-center gap-4 font-black transition-all"
          >
            <UserPlus size={20} />
            {t('careerMaps.addSkill')}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-[460px] bg-slate-50 rounded-[4rem] animate-pulse border border-slate-100/50" />
          ))}
        </div>
      ) : filteredTalent.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-40 bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-900/[0.02] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-20 opacity-[0.02]">
            <Users size={300} className="text-primary" />
          </div>
          <div className="w-28 h-28 rounded-[2.5rem] bg-slate-50 text-slate-200 flex items-center justify-center mb-10 border border-slate-100">
            <Users size={48} />
          </div>
          <p className="text-slate-900 font-extrabold text-3xl tracking-tight mb-2">{t('careerMaps.noPaths')}</p>
          <p className="text-slate-400 font-bold max-w-sm text-center leading-relaxed italic opacity-80 select-none">
            "Your high-potential talent pool is currently empty. Start identifying and nominating top performers for future leadership roles."
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredTalent.map((person, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={person.id}
              className="group bg-white border border-slate-200/60 rounded-[4rem] p-12 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-2xl hover:shadow-primary/5 transition-all duration-700 relative overflow-hidden flex flex-col items-center text-center"
            >
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-125 transition-transform duration-1000">
                <ShieldCheck size={180} className="text-primary" />
              </div>

              <div className="relative z-10 w-full flex flex-col items-center">
                <div className="relative mb-10 scale-100 group-hover:scale-110 transition-transform duration-700">
                  <div className="w-32 h-32 rounded-[3.5rem] bg-indigo-50 text-primary flex items-center justify-center text-3xl font-black shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)] border-4 border-white ring-1 ring-slate-100">
                    {person.employee?.firstName?.[0]}{person.employee?.lastName?.[0]}
                  </div>
                  <div className={`absolute -bottom-2 -right-2 px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border-4 border-white ${getReadinessBadge(person.readiness)} shadow-xl`}>
                    {person.readiness.replace('_', ' ')}
                  </div>
                </div>

                <div className="mb-10 w-full">
                  <h4 className="text-3xl font-extrabold text-slate-900 mb-2 leading-tight tracking-tight group-hover:text-primary transition-colors">
                    {person.employee?.firstName} {person.employee?.lastName}
                  </h4>
                  <div className="flex items-center justify-center gap-2 text-slate-400 font-bold text-sm uppercase tracking-widest opacity-80">
                    <Building2 size={14} />
                    {person.employee?.department}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5 w-full mb-10">
                  <div className="bg-slate-50/50 p-6 rounded-[2.5rem] border border-slate-100/50 flex flex-col items-center gap-2 group/stat">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('potential.high')}</div>
                    <div className="text-sm font-black text-slate-700 flex items-center gap-2">
                       <Star size={14} className="text-amber-400 fill-amber-400" /> Potential
                    </div>
                  </div>
                  <div className="bg-slate-50/50 p-6 rounded-[2.5rem] border border-slate-100/50 flex flex-col items-center gap-2 group/stat">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Velocity</div>
                    <div className="text-sm font-black text-primary flex items-center gap-2">
                      <TrendingUp size={14} /> Active
                    </div>
                  </div>
                </div>

                <div className="w-full pt-10 border-t border-slate-50 flex items-center justify-between">
                  <div className="text-left">
                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Source</div>
                    <div className="text-sm font-black text-slate-600">{person.addedBy?.split('_')[0] || 'System'}</div>
                  </div>
                  <Button variant="ghost" className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all duration-500 flex items-center justify-center p-0">
                    <ChevronRight size={24} />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Identify Talent Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="bg-white rounded-[3rem] p-12 w-full max-w-xl shadow-2xl border border-slate-200"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-5">
                  <div className="p-5 bg-primary/10 text-primary rounded-[1.5rem]">
                    <UserPlus size={32} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t('careerMaps.addSkill')}</h2>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">{t('careerMaps.subtitle')}</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddToPool} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Select Employee</label>
                  <select 
                    required 
                    className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-200 font-black text-slate-700 outline-none focus:ring-4 focus:ring-primary/10 transition-all appearance-none"
                    value={formData.employeeId}
                    onChange={e => setFormData({...formData, employeeId: e.target.value})}
                  >
                    <option value="">{t('employees')}...</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} - {emp.position}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Readiness Level</label>
                  <select 
                    required 
                    className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-200 font-black text-slate-700 outline-none focus:ring-4 focus:ring-primary/10 transition-all appearance-none"
                    value={formData.readiness}
                    onChange={e => setFormData({...formData, readiness: e.target.value})}
                  >
                    <option value="ready_now">{t('careerMaps.readyNow')}</option>
                    <option value="ready_6m">{t('careerMaps.readyIn6Months')}</option>
                    <option value="ready_1y+">{t('careerMaps.readyIn1Year')}</option>
                    <option value="long_term">{t('careerMaps.highPotential')}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Strategic Notes</label>
                  <textarea 
                    className="w-full h-32 p-6 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-slate-700 outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                    placeholder="Why is this person being nominated? Key strengths, future roles..."
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <Button type="button" variant="ghost" className="flex-1 !h-14 rounded-2xl font-black text-slate-400" onClick={() => setIsModalOpen(false)}>
                    Dismiss
                  </Button>
                  <Button type="submit" className="flex-1 !h-14 rounded-2xl font-black shadow-xl shadow-primary/30">
                    {t('save')}
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
