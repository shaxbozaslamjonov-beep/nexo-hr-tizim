'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  TrendingUp, 
  BarChart3, 
  Target, 
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Calendar,
  Layers,
  Plus,
  Trash2,
  X,
  Download,
  Edit2,
  Settings
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface EmployeeProfile {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
}

interface KPIEntry {
  id: string;
  value: number;
  rating: string | null;
  periodDate: string;
  employeeId: string;
}

interface KPIDefinition {
  id: string;
  name: string;
  unit: string;
  targetValue: number;
  description: string;
  employeeId: string | null;
  positionId: string | null;
  position?: { title: string } | null;
  entries: KPIEntry[];
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem',
  borderRadius: '8px',
  border: '1px solid var(--border)',
  outline: 'none',
  fontFamily: 'inherit',
  fontSize: '0.95rem',
  background: 'var(--surface)',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.82rem',
  fontWeight: 700,
  color: '#475569',
  marginBottom: '0.4rem',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

export default function KPIPage() {
  const { t } = useLanguage();
  const { user, isAdmin } = useAuth();
  const [kpis, setKpis] = useState<KPIDefinition[]>([]);
  const [employees, setEmployees] = useState<{ id: string, firstName: string, lastName: string, position?: string, positionRef?: { title: string } }[]>([]);
  const [positions, setPositions] = useState<{ id: string, title: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Entry modal (add a data-point to an existing KPI) ──
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [selectedKpiId, setSelectedKpiId] = useState<string>('');
  const [entryForm, setEntryForm] = useState({
    employeeId: '',
    value: 0,
    periodDate: new Date().toISOString().split('T')[0],
    rating: 'A',
  });

  // ── Definition modal (create / edit a KPI definition) ──
  const [isDefModalOpen, setIsDefModalOpen] = useState(false);
  const [editingKpi, setEditingKpi] = useState<KPIDefinition | null>(null);
  const [kpiForm, setKpiForm] = useState({ name: '', unit: '', targetValue: 100, description: '', employeeId: '', positionId: '' });

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const responses = await Promise.all([
        fetch('/api/kpi/definitions'),
        fetch('/api/employees'),
        fetch('/api/positions'),
      ]);

      const [kpiRes, empRes, posRes] = responses;

      // Handle any non-ok response
      if (!kpiRes.ok || !empRes.ok || !posRes.ok) {
        throw new Error(`One or more API calls failed: KPI(${kpiRes.status}), EMP(${empRes.status}), POS(${posRes.status})`);
      }

      // Safe JSON parsing
      let kpiData, empData, posData;
      try {
        kpiData = await kpiRes.json();
      } catch (e) {
        console.error('KPI definitions fetch failed to parse JSON', e);
        kpiData = [];
      }

      try {
        empData = await empRes.json();
      } catch (e) {
        console.error('Employees fetch failed to parse JSON', e);
        empData = [];
      }

      try {
        posData = await posRes.json();
      } catch (e) {
        console.error('Positions fetch failed to parse JSON', e);
        posData = [];
      }

      if (Array.isArray(kpiData)) setKpis(kpiData);
      if (Array.isArray(empData)) setEmployees(empData);
      if (Array.isArray(posData)) setPositions(posData);
    } catch (error: any) {
      console.error('Failed to fetch initial KPI data:', error);
      toast.error('Failed to load dashboard data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  // ── Entry handlers ──
  const openEntryModal = (kpiId: string) => {
    setSelectedKpiId(kpiId);
    setEntryForm({
      employeeId: employees[0]?.id || '',
      value: 0,
      periodDate: new Date().toISOString().split('T')[0],
      rating: 'A',
    });
    setIsEntryModalOpen(true);
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/kpi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...entryForm, kpiId: selectedKpiId }),
      });
      if (res.ok) {
        toast.success('KPI entry recorded!');
        fetchInitialData();
        setIsEntryModalOpen(false);
      } else {
        toast.error('Failed to save KPI entry');
      }
    } catch {
      toast.error('Network Error');
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Delete this KPI entry?')) return;
    try {
      const res = await fetch(`/api/kpi?id=${entryId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Entry deleted');
        fetchInitialData();
      } else {
        toast.error('Failed to delete entry');
      }
    } catch {
      toast.error('Network Error');
    }
  };

  // ── Definition handlers ──
  const openDefModal = (kpi?: KPIDefinition) => {
    if (kpi) {
      setEditingKpi(kpi);
      setKpiForm({ 
        name: kpi.name, 
        unit: kpi.unit, 
        targetValue: kpi.targetValue,
        description: kpi.description || '',
        employeeId: kpi.employeeId || '',
        positionId: kpi.positionId || '',
      });
    } else {
      setEditingKpi(null);
      setKpiForm({ name: '', unit: '', targetValue: 100, description: '', employeeId: '', positionId: '' });
    }
    setIsDefModalOpen(true);
  };

  const handleSaveDef = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEdit = !!editingKpi;
      const url = isEdit
        ? `/api/kpi/definitions?id=${editingKpi!.id}`
        : '/api/kpi/definitions';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kpiForm),
      });

      if (res.ok) {
        toast.success(isEdit ? 'KPI updated!' : 'KPI created!');
        fetchInitialData();
        setIsDefModalOpen(false);
      } else {
        toast.error(isEdit ? 'Failed to update KPI' : 'Failed to create KPI');
      }
    } catch {
      toast.error('Network Error');
    }
  };

  const handleDeleteKpi = async (kpiId: string) => {
    if (!confirm('Delete this KPI and all its entries? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/kpi/definitions?id=${kpiId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('KPI deleted');
        setKpis((prev) => prev.filter((k) => k.id !== kpiId));
      } else {
        toast.error('Failed to delete KPI');
      }
    } catch {
      toast.error('Network Error');
    }
  };

  const handleExport = async (format: 'excel' | 'csv' | 'pdf') => {
    try {
      const res = await fetch(`/api/kpi/export?format=${format}`);
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kpi_report_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`${format.toUpperCase()} export complete`);
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.6rem', background: 'linear-gradient(135deg, #FF9A8B 0%, #FF6A88 55%, #FF99AC 100%)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(255, 106, 136, 0.3)' }}>
              <Trophy size={24} color="white" />
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{t('kpiPerformance')}</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Track and manage key performance indicators.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {isAdmin && (
            <>
              {/* Export buttons */}
              <button onClick={() => handleExport('excel')} style={{ padding: '0.6rem 1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <Download size={16} color="#10b981" /> Excel
              </button>
              <button onClick={() => handleExport('pdf')} style={{ padding: '0.6rem 1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <Download size={16} color="#ef4444" /> PDF
              </button>
              {/* Create new KPI button */}
              <button
                onClick={() => openDefModal()}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)' }}
              >
                <Plus size={18} /> New KPI
              </button>
            </>
          )}
          <div style={{ background: 'var(--surface)', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.5rem', background: '#ecfdf5', color: '#10b981', borderRadius: '10px' }}><Award size={20} /></div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Monthly Rating</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Rank A+</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Cards grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        {loading ? (
          <div style={{ color: '#94a3b8', gridColumn: '1/-1', textAlign: 'center', padding: '3rem' }}>Loading KPI data...</div>
        ) : kpis.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', background: 'var(--surface)', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
            <BarChart3 size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>No KPI definitions yet.</p>
            {isAdmin && (
              <button onClick={() => openDefModal()} style={{ padding: '0.75rem 1.75rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={16} /> Create your first KPI
              </button>
            )}
          </div>
        ) : kpis.map((kpi) => {
          const latestEntry = kpi.entries[0];
          const prevEntry = kpi.entries[1];
          const hasGrowth = latestEntry && prevEntry ? latestEntry.value >= prevEntry.value : true;
          const percentage = latestEntry ? Math.min((latestEntry.value / kpi.targetValue) * 100, 100) : 0;

          return (
            <motion.div
              key={kpi.id}
              whileHover={{ y: -5 }}
              style={{ background: 'var(--surface)', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ padding: '0.75rem', background: 'var(--background)', borderRadius: '12px' }}>
                  <Activity size={20} color="#6366f1" />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: hasGrowth ? '#10b981' : '#ef4444', fontWeight: 700, fontSize: '0.85rem', background: hasGrowth ? '#f0fdf4' : '#fef2f2', padding: '0.25rem 0.6rem', borderRadius: '20px' }}>
                    {hasGrowth ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {latestEntry && prevEntry ? `${Math.abs(Math.round(((latestEntry.value - prevEntry.value) / prevEntry.value) * 100))}%` : '—'}
                  </div>
                  {isAdmin && (
                    <button onClick={() => openEntryModal(kpi.id)} style={{ padding: '0.35rem 0.6rem', borderRadius: '8px', border: 'none', background: '#e0e7ff', color: '#4f46e5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600, fontSize: '0.8rem' }} title="Add data-point">
                      <Plus size={14} /> Add
                    </button>
                  )}
                  {isAdmin && (
                    <button onClick={() => openDefModal(kpi)} style={{ padding: '0.35rem 0.6rem', borderRadius: '8px', border: 'none', background: '#f0fdf4', color: '#10b981', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600, fontSize: '0.8rem' }} title="Edit KPI definition">
                      <Edit2 size={14} />
                    </button>
                  )}
                  {isAdmin && (
                    <button onClick={() => handleDeleteKpi(kpi.id)} style={{ padding: '0.35rem 0.6rem', borderRadius: '8px', border: 'none', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: '0.8rem' }} title="Delete KPI">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{kpi.name}</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '2rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{latestEntry?.value ?? 0}</span>
                <span style={{ color: '#94a3b8', fontWeight: 600 }}>/ {kpi.targetValue} {kpi.unit}</span>
              </div>

              {latestEntry && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--background)', padding: '0.75rem 1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.8rem' }}>
                  <div style={{ color: 'var(--text-secondary)' }}>Latest: <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{new Date(latestEntry.periodDate).toLocaleDateString()}</span></div>
                  {isAdmin && (
                    <button onClick={() => handleDeleteEntry(latestEntry.id)} style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Delete latest entry">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              )}

              <div style={{ marginTop: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>
                    <Target size={14} /> Progress to Target
                  </div>
                  <div style={{ fontWeight: 800, color: '#6366f1' }}>{Math.round(percentage)}%</div>
                </div>
                <div style={{ height: '8px', background: 'var(--bg-muted)', borderRadius: '4px', overflow: 'hidden', marginTop: '0.75rem' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)' }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Bottom section: Chart + Milestones ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2.5rem' }}>
        <div style={{ background: 'var(--surface)', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Efficiency Trend</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>Weekly</button>
              <button style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: 'none', background: '#1e293b', color: 'white', fontSize: '0.8rem', fontWeight: 600 }}>Monthly</button>
            </div>
          </div>
          <div style={{ height: '300px', width: '100%', borderBottom: '2px solid #f1f5f9', borderLeft: '2px solid #f1f5f9', position: 'relative', display: 'flex', alignItems: 'flex-end', gap: '10%', padding: '0 5%' }}>
            {[40, 65, 55, 80, 75, 90, 85].map((val, idx) => (
              <div key={idx} style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${val}%` }}
                  transition={{ duration: 0.5, delay: idx * 0.07 }}
                  style={{ width: '100%', maxWidth: '30px', background: 'linear-gradient(to top, #6366f1, #a855f7)', borderRadius: '8px 8px 0 0' }}
                />
                <span style={{ position: 'absolute', bottom: '-25px', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 700 }}>M{idx + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ padding: '2rem', borderRadius: '24px', background: 'var(--surface)', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} color="#6366f1" /> Upcoming Milestones
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { title: 'Pass English Test', badge: '+50 pts', date: 'Next Friday' },
                { title: 'Complete Onboarding', badge: 'Level Up', date: 'In 2 weeks' },
                { title: 'Submit Q1 Report', badge: 'Bonus', date: 'Mar 31' },
              ].map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ width: '4px', background: i === 0 ? '#6366f1' : '#e2e8f0', borderRadius: '2px' }} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{m.title}</h4>
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.1rem 0.4rem', borderRadius: '4px', background: '#f5f3ff', color: '#6366f1' }}>{m.badge}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={12} /> {m.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: '2rem', borderRadius: '24px', background: 'linear-gradient(135deg, #a8caba 0%, #5d4157 100%)', color: 'white' }}>
            <Layers size={32} style={{ marginBottom: '1rem', opacity: 0.8 }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Performance Insight</h3>
            <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>You're currently in the top 10% of efficiency this month. Keep up the great work!</p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          MODAL 1 – Add KPI Entry (data-point)
      ═══════════════════════════════════════ */}
      <AnimatePresence>
        {isEntryModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
            onClick={() => setIsEntryModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '24px', width: '90%', maxWidth: '460px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Record Data-Point</h2>
                <button onClick={() => setIsEntryModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={24} /></button>
              </div>

              <form onSubmit={handleSaveEntry} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div>
                  <label style={labelStyle}>Employee *</label>
                  <select required value={entryForm.employeeId} onChange={(e) => setEntryForm({ ...entryForm, employeeId: e.target.value })} style={inputStyle}>
                    <option value="">Select employee…</option>
                    {employees.map((emp: any) => (
                      <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}{emp.positionRef?.title ? ` – ${emp.positionRef.title}` : (emp.position ? ` – ${emp.position}` : '')}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Value (metric result)</label>
                  <input
                    type="number" step="0.1" required
                    value={entryForm.value}
                    onChange={(e) => setEntryForm({ ...entryForm, value: parseFloat(e.target.value) })}
                    style={inputStyle}
                    placeholder="e.g. 85"
                  />
                </div>

                <div>
                  <label style={labelStyle}>Rating</label>
                  <select required value={entryForm.rating} onChange={(e) => setEntryForm({ ...entryForm, rating: e.target.value })} style={inputStyle}>
                    {['S', 'A', 'B', 'C', 'D'].map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Period Date</label>
                  <input type="date" required value={entryForm.periodDate} onChange={(e) => setEntryForm({ ...entryForm, periodDate: e.target.value })} style={inputStyle} />
                </div>

                <button
                  type="submit" disabled={!entryForm.employeeId}
                  style={{ marginTop: '0.5rem', width: '100%', padding: '0.875rem', background: entryForm.employeeId ? '#4f46e5' : '#cbd5e1', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: entryForm.employeeId ? 'pointer' : 'not-allowed' }}
                >
                  Publish Entry
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════
          MODAL 2 – Create / Edit KPI Definition
      ═══════════════════════════════════════ */}
      <AnimatePresence>
        {isDefModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
            onClick={() => setIsDefModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '24px', width: '90%', maxWidth: '460px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
                    {editingKpi ? 'Edit KPI' : 'New KPI'}
                  </h2>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.35rem 0 0 0' }}>
                    {editingKpi ? 'Update definition details.' : 'Define a new performance indicator.'}
                  </p>
                </div>
                <button onClick={() => setIsDefModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={24} /></button>
              </div>

              <form onSubmit={handleSaveDef} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div>
                  <label style={labelStyle}>KPI Name *</label>
                  <input
                    required type="text"
                    value={kpiForm.name}
                    onChange={(e) => setKpiForm({ ...kpiForm, name: e.target.value })}
                    style={inputStyle}
                    placeholder="e.g. Sales Revenue"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Unit *</label>
                    <input
                      required type="text"
                      value={kpiForm.unit}
                      onChange={(e) => setKpiForm({ ...kpiForm, unit: e.target.value })}
                      style={inputStyle}
                      placeholder="e.g. %, $, tasks"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Target Value *</label>
                    <input
                      required type="number" step="0.01" min="0"
                      value={kpiForm.targetValue}
                      onChange={(e) => setKpiForm({ ...kpiForm, targetValue: parseFloat(e.target.value) })}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea
                    value={kpiForm.description}
                    onChange={(e) => setKpiForm({ ...kpiForm, description: e.target.value })}
                    style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                    placeholder="Describe this KPI's purpose..."
                  />
                </div>

                <div>
                  <label style={labelStyle}>Employee Assignment (Optional)</label>
                  <select
                    value={kpiForm.employeeId}
                    onChange={(e) => setKpiForm({ ...kpiForm, employeeId: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="">General KPI</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Position Assignment (Optional)</label>
                  <select
                    value={kpiForm.positionId}
                    onChange={(e) => setKpiForm({ ...kpiForm, positionId: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="">General KPI</option>
                    {positions.map((pos) => (
                      <option key={pos.id} value={pos.id}>{pos.title}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!kpiForm.name || !kpiForm.unit}
                  style={{ marginTop: '0.5rem', width: '100%', padding: '0.875rem', background: (kpiForm.name && kpiForm.unit) ? '#4f46e5' : '#cbd5e1', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: (kpiForm.name && kpiForm.unit) ? 'pointer' : 'not-allowed' }}
                >
                  {editingKpi ? 'Save Changes' : 'Create KPI'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
