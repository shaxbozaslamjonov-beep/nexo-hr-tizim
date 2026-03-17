'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Map, Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import { StatsCards, CareerHealthCard, TabsNavigation, PositionFormModal } from '@/components/career';
import { PositionCard } from '@/components/career/PositionCard';

// interface for Position data
interface Position {
  id: string;
  title: string;
  grade: number;
  department: string;
  requiredSkills: string[] | string;
  nextPositions: string[] | string;
  readiness?: number;
  status?: string;
}

export default function AdvancedCareerMapPage() {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);

  const fetchPositions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/positions');
      const data = await response.json();
      if (Array.isArray(data)) {
        setPositions(data);
      } else {
        setPositions([]);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Ma\'lumotlarni yuklashda hatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  const handleCreatePosition = () => {
    setEditingPosition(null);
    setIsModalOpen(true);
  };

  const handleEditPosition = (pos: Position) => {
    setEditingPosition(pos);
    setIsModalOpen(true);
  };

  const handleDeletePosition = async (id: string) => {
    if (!confirm(t('common.confirmDelete') || 'Haqiqatan ham ushbu lavozimni o‘chirmoqchimisiz?')) return;
    
    try {
      const response = await fetch(`/api/positions?id=${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        toast.success(t('common.deleted') || 'O‘chirildi');
        fetchPositions();
      } else {
        toast.error('O‘chirishda hatolik yuz berdi');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Tarmoq hatoligi');
    }
  };

  const handleSavePosition = async (data: any) => {
    try {
      const isEdit = !!editingPosition;
      const url = isEdit ? `/api/positions?id=${editingPosition.id}` : '/api/positions';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success(isEdit ? 'Yangilandi' : 'Yaratildi');
        fetchPositions();
        setIsModalOpen(false);
      } else {
        const err = await response.json();
        toast.error(err.error || 'Saqlashda hatolik yuz berdi');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Tarmoq hatoligi');
    }
  };

  const filteredPositions = positions.filter(pos => {
    const matchesFilter = activeFilter === 'all' || pos.status === activeFilter;
    const matchesSearch = (pos.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (pos.department || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filters = [
    { id: 'all', key: 'careerMaps.filters.all' },
    { id: 'active', key: 'careerMaps.filters.active' },
    { id: 'completed', key: 'careerMaps.filters.completed' },
    { id: 'highPotential', key: 'careerMaps.filters.highPotential' },
  ];

  return (
    <div className="animate-fade-in" style={{ padding: '2rem' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ padding: '0.6rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(102,126,234,0.3)' }}>
              <Map size={24} color="white" />
            </div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#1e293b', margin: 0, letterSpacing: '-0.02em' }}>{t('careerMaps.pageTitle')}</h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '1rem', margin: 0, fontWeight: 500 }}>{t('careerMaps.subtitle')}</p>
        </div>
      </div>

      {/* ── Top Section: Stats ── */}
      <div style={{ marginBottom: '2rem' }}>
        <StatsCards />
      </div>

      {/* ── Career Health Row ── */}
      <div style={{ marginBottom: '2.5rem' }}>
        <CareerHealthCard />
      </div>

      {/* ── Cohesive Row: Filters, Search, Create ── */}
      <div style={{ 
        background: 'white', 
        borderRadius: '20px', 
        border: '1px solid #f1f5f9', 
        padding: '1rem',
        marginBottom: '1.5rem',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem', padding: '0.35rem', background: '#f8fafc', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                style={{
                  padding: '0.6rem 1.25rem', borderRadius: '11px', border: 'none', cursor: 'pointer',
                  fontSize: '0.85rem', fontWeight: 700, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: activeFilter === filter.id ? 'white' : 'transparent',
                  color: activeFilter === filter.id ? '#6366f1' : '#94a3b8',
                  boxShadow: activeFilter === filter.id ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                }}
              >
                {t(filter.key)}
                {activeFilter === filter.id && (
                  <span style={{
                    marginLeft: '0.5rem', fontSize: '0.7rem', fontWeight: 900,
                    padding: '0.15rem 0.5rem', borderRadius: '20px',
                    background: '#6366f1', color: 'white',
                  }}>
                    {filteredPositions.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexGrow: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                placeholder={t('careerMaps.filters.search') || "Lavozimlar bo'yicha qidirish..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '0.7rem 1rem 0.7rem 2.75rem',
                  borderRadius: '12px', border: '1px solid #edf2f7', fontSize: '0.85rem',
                  outline: 'none', background: '#ffffff', fontFamily: 'inherit',
                  boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.02)',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#edf2f7'}
              />
            </div>
            
            <button
              onClick={handleCreatePosition}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.7rem 1.25rem', background: 'var(--primary, #6366f1)', color: 'white',
                border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(99,102,241,0.3)', fontSize: '0.85rem',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(99,102,241,0.4)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(99,102,241,0.3)'; }}
            >
              <Plus size={18} /> {t('careerMaps.newPosition')}
            </button>
          </div>
        </div>
      </div>

      {/* ── Tabs Navigation ── */}
      <TabsNavigation handleAction={handleCreatePosition}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem',
          paddingTop: '0.5rem',
        }}>
          {loading ? (
            <div style={{ gridColumn: '1 / -1', padding: '8rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
              <div className="relative">
                <Loader2 className="animate-spin" size={48} color="#6366f1" />
                <div className="absolute inset-0 blur-2xl bg-primary/20 animate-pulse" />
              </div>
              <p style={{ color: '#94a3b8', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.01em' }}>Ma'lumotlar yuklanmoqda...</p>
            </div>
          ) : filteredPositions.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1', padding: '6rem', textAlign: 'center',
              background: 'white', borderRadius: '32px', border: '2px dashed #e2e8f0',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem',
              boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.02)'
            }}>
              <div style={{ padding: '1.5rem', borderRadius: '24px', background: '#f8fafc', color: '#cbd5e1' }}>
                <Search size={48} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>Hech narsa topilmadi</h3>
                <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 500, maxWidth: '300px', margin: '0 auto' }}>
                  Sizning qidiruvingizga mos keladigan lavozimlar mavjud emas.
                </p>
              </div>
              <button 
                onClick={handleCreatePosition}
                style={{ 
                  marginTop: '0.5rem', padding: '0.8rem 2rem', background: '#6366f1', 
                  border: 'none', borderRadius: '14px', color: 'white', fontWeight: 800, 
                  cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(99,102,241,0.2)',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Yangi lavozim qo'shish
              </button>
            </div>
          ) : (
            filteredPositions.map((pos) => (
              <PositionCard
                key={pos.id}
                title={pos.title}
                grade={pos.grade.toString()}
                department={pos.department}
                requiredSkills={Array.isArray(pos.requiredSkills) ? pos.requiredSkills.join(', ') : pos.requiredSkills}
                nextPositions={Array.isArray(pos.nextPositions) ? pos.nextPositions.join(', ') : (pos.nextPositions || '')}
                readiness={pos.readiness || 0}
                onEdit={() => handleEditPosition(pos)}
                onDelete={() => handleDeletePosition(pos.id)}
              />
            ))
          )}
        </div>
      </TabsNavigation>

      {/* ── Modals ── */}
      <PositionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePosition}
        initialData={editingPosition}
        title={editingPosition ? (t('careerMaps.editPosition') || 'Lavozimni tahrirlash') : (t('careerMaps.newPosition') || 'Yangi lavozim')}
      />
    </div>
  );
}
