'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Timer,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Trash2,
  X,
  Edit2,
  Calendar,
  Star,
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

interface Evaluation {
  id: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    position: string;
    user: { email: string };
  };
  evaluator: { id: string, email: string };
  position?: { id: string, title: string } | null;
  positionId?: string | null;
  disciplineScore: number;
  learningScore: number;
  qualityScore: number;
  result: 'PASSED' | 'EXTENDED' | 'FAILED';
  evaluatedAt: string;
  startDate: string | null;
  endDate: string | null;
  comments: string;
  periodDays: number;
}

const EMPTY_FORM = {
  employeeId: '',
  evaluatorId: '',
  positionId: '',
  periodDays: 30,
  startDate: '',
  endDate: '',
  disciplineScore: 5,
  learningScore: 5,
  qualityScore: 5,
  comments: '',
  result: 'PASSED',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  outline: 'none',
  fontFamily: 'inherit',
  fontSize: '0.95rem',
  background: 'white',
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

export default function ProbationPage() {
  const { t } = useLanguage();
  const { user, isAdmin } = useAuth();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [positions, setPositions] = useState<{id: string, title: string}[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<typeof EMPTY_FORM>({ ...EMPTY_FORM });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [evalRes, empRes, posRes] = await Promise.all([
        fetch('/api/probation'),
        fetch('/api/employees'),
        fetch('/api/positions'),
      ]);
      const evalData = await evalRes.json();
      if (Array.isArray(evalData)) setEvaluations(evalData);

      const empData = await empRes.json();
      if (Array.isArray(empData)) setEmployees(empData);

      const posData = await posRes.json();
      if (Array.isArray(posData)) setPositions(posData);
    } catch (error) {
      console.error('Failed to fetch data', error);
      toast.error('Failed to fetch evaluation data.');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (ev?: Evaluation) => {
    if (ev) {
      setEditingId(ev.id);
      setFormData({
        employeeId: ev.employee?.id || '',
        periodDays: ev.periodDays,
        startDate: ev.startDate ? new Date(ev.startDate).toISOString().split('T')[0] : '',
        endDate: ev.endDate ? new Date(ev.endDate).toISOString().split('T')[0] : '',
        disciplineScore: ev.disciplineScore,
        learningScore: ev.learningScore,
        qualityScore: ev.qualityScore,
        comments: ev.comments || '',
        result: ev.result,
        evaluatorId: ev.evaluator?.id || '',
        positionId: ev.positionId || '',
      });
    } else {
      setEditingId(null);
      setFormData({ ...EMPTY_FORM, employeeId: employees[0]?.id || '', evaluatorId: user?.id || '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const isEdit = !!editingId;
      const url = isEdit ? `/api/probation?id=${editingId}` : '/api/probation';
      const method = isEdit ? 'PUT' : 'POST';
      const payload = isEdit
        ? { ...formData }
        : { ...formData, evaluatorId: formData.evaluatorId || user.id };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(isEdit ? 'Evaluation updated!' : 'Evaluation created!');
        fetchInitialData();
        setIsModalOpen(false);
      } else {
        toast.error(isEdit ? 'Failed to update evaluation' : 'Failed to create evaluation');
      }
    } catch {
      toast.error('Network error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this evaluation?')) return;
    try {
      const res = await fetch(`/api/probation?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEvaluations((prev) => prev.filter((e) => e.id !== id));
        toast.success('Evaluation deleted.');
      } else {
        toast.error('Failed to delete evaluation.');
      }
    } catch {
      toast.error('Network Error.');
    }
  };

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'PASSED':   return { color: '#10b981', bg: '#ecfdf5', icon: <CheckCircle size={14} />, label: 'Passed' };
      case 'EXTENDED': return { color: '#f59e0b', bg: '#fffbeb', icon: <AlertCircle size={14} />, label: 'Extended' };
      case 'FAILED':   return { color: '#ef4444', bg: '#fef2f2', icon: <XCircle size={14} />, label: 'Failed' };
      default:         return { color: '#64748b', bg: '#f8fafc', icon: null, label: result };
    }
  };

  const avgScore = ((formData.disciplineScore + formData.learningScore + formData.qualityScore) / 3).toFixed(1);

  function ScoreSlider({ label, field }: { label: string; field: 'disciplineScore' | 'learningScore' | 'qualityScore' }) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>{label}</label>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: '#4f46e5' }}>{formData[field]}</span>
        </div>
        <input
          type="range" min={1} max={5} step={1}
          value={formData[field]}
          onChange={(e) => setFormData({ ...formData, [field]: parseInt(e.target.value) })}
          style={{ width: '100%', accentColor: '#4f46e5' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#94a3b8', marginTop: '0.15rem' }}>
          <span>1 (Poor)</span><span>2</span><span>3 (Average)</span><span>4</span><span>5 (Excellent)</span>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '2rem' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.6rem', background: 'linear-gradient(135deg, #FAD961 0%, #F76B1C 100%)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(247, 107, 28, 0.3)' }}>
              <Timer size={24} color="white" />
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>{t('probation')}</h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Manage and review employee trial period evaluations.</p>
        </div>

        {isAdmin && (
          <button
            onClick={() => openModal()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)' }}
          >
            <Plus size={20} /> {t('training.addNew') || '+ Yangi sinov muddati'}
          </button>
        )}
      </div>

      {/* ── Summary stats ── */}
      {evaluations.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {[
            { label: 'Passed', value: evaluations.filter(e => e.result === 'PASSED').length, color: '#10b981', bg: '#ecfdf5' },
            { label: 'Extended', value: evaluations.filter(e => e.result === 'EXTENDED').length, color: '#f59e0b', bg: '#fffbeb' },
            { label: 'Failed', value: evaluations.filter(e => e.result === 'FAILED').length, color: '#ef4444', bg: '#fef2f2' },
          ].map((stat) => (
            <div key={stat.label} style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: stat.color }}>{stat.value}</span>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>evaluations</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Evaluations list ── */}
      <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Recent Evaluations
          <span style={{ fontSize: '0.8rem', fontWeight: 500, background: '#f1f5f9', color: '#64748b', padding: '0.2rem 0.6rem', borderRadius: '20px' }}>{evaluations.length} total</span>
        </h2>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading records...</div>
        ) : evaluations.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', background: '#f8fafc', borderRadius: '20px', border: '2px dashed #e2e8f0' }}>
            <AlertCircle size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
            <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '1.5rem' }}>No evaluations recorded yet.</p>
            {isAdmin && (
              <button onClick={() => openModal()} style={{ padding: '0.75rem 1.5rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={16} /> Create first evaluation
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <AnimatePresence>
              {evaluations.map((ev) => {
                const badge = getResultBadge(ev.result);
                const avg = (ev.disciplineScore + ev.learningScore + ev.qualityScore) / 3;

                return (
                  <motion.div
                    key={ev.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ scale: 1.005, boxShadow: '0 10px 20px -5px rgba(0,0,0,0.06)' }}
                    style={{ padding: '1.5rem', borderRadius: '20px', background: 'white', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}
                  >
                    {/* Employee avatar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '200px', flex: '1 1 200px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>👤</div>
                      <div>
                        <h4 style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>
                          {ev.employee?.firstName || 'Unknown'} {ev.employee?.lastName || ''}
                        </h4>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                          {ev.position?.title || ev.employee?.position || 'Employee'}
                        </p>
                      </div>
                    </div>

                    {/* Score bar */}
                    <div style={{ flex: '2 1 240px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.4rem' }}>
                        <span>Average Score</span>
                        <span>{avg.toFixed(1)} / 5.0</span>
                      </div>
                      <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${(avg / 5) * 100}%`, height: '100%', background: avg > 4 ? '#10b981' : avg > 3 ? '#f59e0b' : '#ef4444', borderRadius: '4px', transition: 'width 0.5s ease' }} />
                      </div>
                      {ev.comments && (
                        <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.5rem', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '280px' }}>
                          "{ev.comments}"
                        </p>
                      )}
                    </div>

                    {/* Date */}
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}>
                      <Calendar size={14} />
                      {new Date(ev.evaluatedAt).toLocaleDateString()}
                    </div>

                    {/* Result badge */}
                    <div style={{ padding: '0.4rem 0.85rem', borderRadius: '10px', background: badge.bg, color: badge.color, fontWeight: 700, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      {badge.icon} {badge.label}
                    </div>

                    {/* Actions */}
                    {isAdmin && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => openModal(ev)}
                          title="Edit"
                          style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', color: '#0ea5e9', cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
                          onMouseOver={(e) => { e.currentTarget.style.background = '#bae6fd'; }}
                          onMouseOut={(e) => { e.currentTarget.style.background = '#f0f9ff'; }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(ev.id)}
                          title="Delete"
                          style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '10px', color: '#ef4444', cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
                          onMouseOver={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
                          onMouseOut={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════
          MODAL – Create / Edit Evaluation
      ═══════════════════════════════════════════════ */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: 'white', padding: '2rem', borderRadius: '24px', width: '100%', maxWidth: '580px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
                    {editingId ? 'Edit Evaluation' : 'New Evaluation'}
                  </h2>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.35rem 0 0 0' }}>
                    {editingId ? 'Update scores and result.' : 'Record a new trial period result.'}
                  </p>
                </div>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={24} /></button>
              </div>

              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
                {/* Employee select – only for new evaluations */}
                {!editingId && (
                  <div>
                    <label style={labelStyle}>Employee *</label>
                    <select
                      required value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      style={inputStyle}
                    >
                      <option value="">Select employee…</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.firstName} {emp.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label style={labelStyle}>Position (evaluated for)</label>
                  <select
                    value={formData.positionId || ''}
                    onChange={(e) => setFormData({ ...formData, positionId: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="">Select position…</option>
                    {positions.map((pos) => (
                      <option key={pos.id} value={pos.id}>{pos.title}</option>
                    ))}
                  </select>
                </div>

                {/* Dates */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Period days & Reviewer */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Period (days)</label>
                    <input
                      type="number" min={1} max={365}
                      value={formData.periodDays}
                      onChange={(e) => setFormData({ ...formData, periodDays: parseInt(e.target.value) })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Reviewer *</label>
                    <select
                      required
                      value={formData.evaluatorId}
                      onChange={(e) => setFormData({ ...formData, evaluatorId: e.target.value })}
                      style={inputStyle}
                    >
                      <option value="">Select Reviewer...</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Score sliders */}
                <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <ScoreSlider label="Discipline" field="disciplineScore" />
                  <ScoreSlider label="Learning Speed" field="learningScore" />
                  <ScoreSlider label="Work Quality" field="qualityScore" />
                </div>

                {/* Calculated average */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: '#f0f4ff', borderRadius: '12px', border: '1px solid #e0e7ff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#4f46e5' }}>
                    <Star size={16} /> Calculated Average
                  </div>
                  <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#4f46e5' }}>{avgScore} / 5.0</span>
                </div>

                {/* Result */}
                <div>
                  <label style={labelStyle}>Overall Result *</label>
                  <select
                    value={formData.result}
                    onChange={(e) => setFormData({ ...formData, result: e.target.value as any })}
                    style={inputStyle}
                  >
                    <option value="PASSED">✅ Passed</option>
                    <option value="EXTENDED">⏳ Extended</option>
                    <option value="FAILED">❌ Failed</option>
                  </select>
                </div>

                {/* Comments */}
                <div>
                  <label style={labelStyle}>Comments</label>
                  <textarea
                    value={formData.comments}
                    onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                    style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                    placeholder="Provide justification for the result…"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!editingId && !formData.employeeId}
                  style={{ width: '100%', padding: '0.9rem', background: (!editingId && !formData.employeeId) ? '#cbd5e1' : '#4f46e5', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: (!editingId && !formData.employeeId) ? 'not-allowed' : 'pointer', fontSize: '1rem', transition: 'background 0.2s' }}
                >
                  {editingId ? 'Save Changes' : 'Submit Evaluation'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
