'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Settings2, 
  Map as MapIcon, 
  ChevronRight, 
  MoreVertical, 
  Edit, 
  Trash2,
  ExternalLink,
  Award,
  ChevronDown,
  Building2,
  Trophy,
  Target,
  Layout,
  Network
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

interface CareerMapTreeProps {
  onEmpty?: () => void;
  onData?: () => void;
}

export default function CareerMapTree({ onEmpty, onData }: CareerMapTreeProps) {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<any>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState({
    title: '',
    department: '',
    grade: 1,
    reportsTo: '',
    rolePurpose: '',
    responsibilities: [] as string[],
    kpi: [] as {name: string, target: string}[],
    requiredSkills: [] as {name: string, level: number}[],
    minExperience: 0
  });

  useEffect(() => {
    fetchPositions();
    
    // Listen for global "Add Position" events from parent
    const handleAddGlobal = () => openModal();
    window.addEventListener('open-add-position-modal', handleAddGlobal);
    return () => window.removeEventListener('open-add-position-modal', handleAddGlobal);
  }, []);

  const fetchPositions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/positions');
      const data = await res.json();
      if (Array.isArray(data)) {
        setPositions(data);
        if (data.length === 0) {
          onEmpty?.();
        } else {
          onData?.();
        }
      }
    } catch (error) {
      toast.error('Failed to load positions');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (pos?: any) => {
    if (pos) {
      setEditingPosition(pos);
      setFormData({
        title: pos.title,
        department: pos.department,
        grade: pos.grade,
        reportsTo: pos.reportsTo || '',
        rolePurpose: pos.rolePurpose || '',
        responsibilities: pos.responsibilities || [],
        kpi: pos.kpi || [],
        requiredSkills: pos.requiredSkills || [],
        minExperience: pos.minExperience || 0
      });
    } else {
      setEditingPosition(null);
      setFormData({
        title: '',
        department: '',
        grade: 1,
        reportsTo: '',
        rolePurpose: '',
        responsibilities: [],
        kpi: [],
        requiredSkills: [],
        minExperience: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingPosition ? 'PUT' : 'POST';
      const url = editingPosition ? `/api/positions/${editingPosition.id}` : '/api/positions';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(editingPosition ? 'Position updated' : 'Position created');
        fetchPositions();
        setIsModalOpen(false);
      } else {
        toast.error('Failed to save position');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('careerMaps.confirmDelete'))) return;
    try {
      const res = await fetch(`/api/positions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Position deleted');
        fetchPositions();
      } else {
        toast.error('Failed to delete position');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const toggleExpand = (id: string) => {
    const next = new Set(expandedNodes);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedNodes(next);
  };

  // Helper to build hierarchy
  const buildTree = (pts: any[], parentId: string | null = null): any[] => {
    return pts
      .filter(p => p.reportsTo === (parentId || '')) // Handle null/empty as top level
      .map(p => ({
        ...p,
        children: buildTree(pts, p.id)
      }));
  };

  const hierarchy = buildTree(positions);

  const PositionNode = ({ node, level }: { node: any, level: number }) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div className="flex flex-col">
        <div 
          className={`
            group relative flex items-center p-4 mb-4 rounded-xl border transition-all
            ${isExpanded 
              ? 'bg-white border-primary/20 shadow-md' 
              : 'bg-white border-slate-100 hover:border-primary/20 hover:shadow-sm'
            }
          `}
          style={{ marginLeft: `${level * 2}rem` }}
        >
          {/* Connection Line for hierarchy */}
          {level > 0 && (
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-4 h-px bg-slate-200" />
          )}

          <div className="mr-4 flex items-center">
            {hasChildren ? (
              <button 
                onClick={() => toggleExpand(node.id)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isExpanded ? 'rotate-180 bg-primary/10 text-primary' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
              >
                <ChevronDown size={16} />
              </button>
            ) : (
              <div className="w-8 h-8 flex items-center justify-center text-slate-200">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              </div>
            )}
          </div>

          <div className="flex-shrink-0 w-10 h-10 bg-slate-50 text-slate-400 rounded-lg mr-4 flex items-center justify-center group-hover:text-primary transition-colors border border-slate-100">
            <Award size={20} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h4 className="text-base font-bold text-slate-900 truncate">
                {node.title}
              </h4>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold">
                G{node.grade}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-medium text-slate-400">
              <span className="flex items-center gap-1">
                <Building2 size={12} />
                {node.department}
              </span>
              <span className="flex items-center gap-1">
                <Target size={12} />
                {node.requiredSkills?.length || 0} {t('careerMaps.skills')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
            {isAdmin && (
              <>
                <button 
                  onClick={() => openModal(node)} 
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(node.id)} 
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
            <div className="w-px h-4 bg-slate-200 mx-1" />
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
              <ExternalLink size={16} />
            </Button>
          </div>
        </div>

        {isExpanded && node.children.map((child: any) => (
          <PositionNode key={child.id} node={child} level={level + 1} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Management Control Hub */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input 
            placeholder={t('search')} 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex items-center gap-2">
            <Settings2 size={18} />
            {t('sidebar.lessonSettings')}
          </Button>
          
          <Button variant="outline" className="flex items-center gap-2">
             <MapIcon size={18} />
             Visual Mode
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-28 bg-slate-50 rounded-3xl animate-pulse border border-slate-100/50" />
          ))}
        </div>
      ) : positions.length === 0 ? (
        <div className="py-20 flex flex-col items-center text-center max-w-lg mx-auto">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mb-6">
            <Network size={32} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">
            {t('careerMaps.noPaths')}
          </h3>
          <p className="text-slate-500 mb-8">
            Define positions, mapping growth levels, and identifying core skills for your team's success.
          </p>

          {isAdmin && (
            <Button 
              onClick={() => openModal()}
              className="px-8"
            >
              <Plus size={20} className="mr-2" />
              {t('careerMaps.createPosition')}
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          {hierarchy.length > 0 ? (
            <div className="space-y-2">
              {hierarchy.map(root => <PositionNode key={root.id} node={root} level={0} />)}
            </div>
          ) : (
            <div className="space-y-2">
              {positions
                .filter(p => {
                  const searchLower = searchTerm.toLowerCase();
                  return p.title.toLowerCase().includes(searchLower) || p.department.toLowerCase().includes(searchLower);
                })
                .map(p => <PositionNode key={p.id} node={{...p, children: []}} level={0} />)
              }
            </div>
          )}
        </div>
      )}

      {/* Modal for Create/Edit Position */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                  <Trophy size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {editingPosition ? t('careerMaps.editPosition') : t('careerMaps.createPosition')}
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">{t('careerMaps.subtitle')}</p>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('vacancies.form.title')}</label>
                    <Input 
                      required 
                      value={formData.title} 
                      onChange={e => setFormData({...formData, title: e.target.value})} 
                      className="bg-slate-50 border-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('vacancies.form.department')}</label>
                    <Input 
                      required 
                      value={formData.department} 
                      onChange={e => setFormData({...formData, department: e.target.value})} 
                      className="bg-slate-50 border-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('careerMaps.grade')}</label>
                    <Input 
                      type="number"
                      value={formData.grade} 
                      onChange={e => setFormData({...formData, grade: parseInt(e.target.value)})} 
                      className="bg-slate-50 border-slate-200"
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('careerMaps.reportsTo')}</label>
                    <select 
                      value={formData.reportsTo} 
                      onChange={e => setFormData({...formData, reportsTo: e.target.value})} 
                      className="w-full h-10 px-4 rounded-lg bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 outline-none"
                    >
                      <option value="">{t('careerMaps.topLevel')}</option>
                      {positions.filter(p => !editingPosition || p.id !== editingPosition.id).map(p => (
                        <option key={p.id} value={p.id}>{p.title} - {p.department}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('careerMaps.rolePurpose')}</label>
                  <textarea 
                    value={formData.rolePurpose} 
                    onChange={e => setFormData({...formData, rolePurpose: e.target.value})} 
                    className="w-full h-24 p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Briefly describe the overall purpose of this role..."
                  />
                </div>

                <div className="flex gap-3 pt-6 border-t border-slate-100">
                  <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsModalOpen(false)}>
                    {t('cancel')}
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingPosition ? t('careerMaps.updateArchitecture') : t('careerMaps.createPosition')}
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
