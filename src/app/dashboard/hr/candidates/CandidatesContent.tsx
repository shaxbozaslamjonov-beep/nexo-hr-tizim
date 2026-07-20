'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { candidateService } from '@/lib/services/candidateService';
import { Candidate as CandidateType } from '@/types';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import Link from 'next/link';
import styles from './candidates.module.css';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { 
  Trash2, 
  Eye, 
  Search as SearchIcon, 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileIcon as FilePdf, 
  UserPlus, 
  X, 
  Layers, 
  List as ListIcon,
  MoreVertical,
  MessageSquare,
  Calendar,
  FolderHeart,
  ArrowRight,
  Send,
  CheckSquare,
  ChevronDown
} from 'lucide-react';
import { exportService } from '@/lib/services/exportService';
import MultiStepApplicationForm from '@/components/application/MultiStepApplicationForm';
import toast from 'react-hot-toast';

// dnd-kit imports
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const STATUS_OPTIONS = ['SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED', 'HIRED'];

export function CandidatesContent() {
  const { t, language } = useLanguage();
  const [candidates, setCandidates] = useState<CandidateType[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [msgModal, setMsgModal] = useState<{ open: boolean; candidateId: string | null }>({ open: false, candidateId: null });
  const [messageText, setMessageText] = useState('');

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const data = await candidateService.getAllCandidates();
      setCandidates(data);
    } catch (e) {
      console.error('Failed to fetch candidates:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const matchFilter = filter === 'ALL' || c.status === filter;
      const name = `${c.firstName} ${c.lastName}`.toLowerCase();
      const matchSearch = !search || name.includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [candidates, filter, search]);

  const handleExport = (format: string) => {
    const targetData = selectedIds.length > 0 
      ? candidates.filter(c => selectedIds.includes(c.id)) 
      : filteredCandidates;

    if (targetData.length === 0) {
      toast.error('No candidates to export');
      return;
    }

    const data = targetData.map(c => ({
      'Name': `${c.firstName} ${c.lastName}`,
      'Email': c.email,
      'Status': c.status,
      'Vacancy': c.vacancyTitle,
      'Stage': c.stage,
      'Region': c.region || 'N/A',
      'Applied': new Date(c.appliedAt).toLocaleDateString()
    }));

    if (format === 'excel') {
      exportService.toExcel(data, `Candidates_${new Date().toISOString().split('T')[0]}`);
      toast.success('Excel exported');
    } else if (format === 'pdf') {
       const headers = ['Name', 'Status', 'Vacancy', 'Stage', 'Region', 'Applied'];
       const body = targetData.map(c => [
         `${c.firstName} ${c.lastName}`,
         c.status,
         c.vacancyTitle,
         c.stage,
         c.region || '-',
         new Date(c.appliedAt).toLocaleDateString()
       ]);
       exportService.toPDF(headers, body, 'Candidates_Report', 'Candidate List');
       toast.success('PDF exported');
    } else {
      toast.error('Word export coming soon');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('confirmDeleteCandidate'))) {
      try {
        await candidateService.deleteCandidate(id);
        setCandidates(prev => prev.filter(c => c.id !== id));
        toast.success(t('deleted'));
      } catch (e) {
        toast.error('Delete failed');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`Delete ${selectedIds.length} candidates?`)) {
      try {
        for (const id of selectedIds) {
          await candidateService.deleteCandidate(id);
        }
        setCandidates(prev => prev.filter(c => !selectedIds.includes(c.id)));
        setSelectedIds([]);
        toast.success('Deleted selected');
      } catch (e) {
        toast.error('Bulk delete failed');
      }
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await candidateService.updateCandidate(id, { status: newStatus as any });
      setCandidates(prev => prev.map(c => c.id === id ? { ...c, status: newStatus as any } : c));
      toast.success('Status updated');
    } catch (e) {
      toast.error('Update failed');
    }
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    try {
      for (const id of selectedIds) {
        await candidateService.updateCandidate(id, { status: newStatus as any });
      }
      setCandidates(prev => prev.map(c => selectedIds.includes(c.id) ? { ...c, status: newStatus as any } : c));
      setSelectedIds([]);
      toast.success('Bulk status updated');
    } catch (e) {
      toast.error('Bulk update failed');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCandidates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCandidates.map(c => c.id));
    }
  };

  const handleSendMessage = () => {
    toast.success(t('candidatesModule.messageModal.success'));
    setMsgModal({ open: false, candidateId: null });
    setMessageText('');
  };

  // Drag and Drop Logic
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      const activeId = active.id;
      let overStatus = over.id;
      
      // If dropped over a card, get its column status
      if (!STATUS_OPTIONS.includes(overStatus)) {
        const overCandidate = candidates.find(c => c.id === overStatus);
        if (overCandidate) {
          overStatus = overCandidate.status;
        }
      }

      if (STATUS_OPTIONS.includes(overStatus)) {
        handleUpdateStatus(activeId as string, overStatus as string);
      }
    }
  };

  return (
    <div className="animate-fade-in">
      <div className={styles.pageHeader}>
        <div className={styles.headerBg} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 className={styles.pageTitle}>{t('candidates.title')}</h1>
          <p className={styles.pageSubtitle}>Manage your recruitment pipeline</p>
        </div>
        <div className={styles.headerActions}>
           <div className={styles.viewToggle}>
              <button 
                className={`${styles.toggleBtn} ${viewMode === 'list' ? styles.toggleBtnActive : ''}`}
                onClick={() => setViewMode('list')}
              >
                <ListIcon size={18} />
                {t('candidatesModule.list')}
              </button>
              <button 
                className={`${styles.toggleBtn} ${viewMode === 'kanban' ? styles.toggleBtnActive : ''}`}
                onClick={() => setViewMode('kanban')}
              >
                <Layers size={18} />
                {t('candidatesModule.kanban')}
              </button>
           </div>
           <button
            onClick={() => setIsModalOpen(true)}
            className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
          >
            <UserPlus size={18} />
            {t('addNew')}
          </button>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.filters}>
          <button 
            className={`${styles.filterBtn} ${filter === 'ALL' ? styles.filterBtnActive : ''}`}
            onClick={() => setFilter('ALL')}
          >
            {t('all')}
          </button>
          {STATUS_OPTIONS.map(s => (
            <button 
              key={s}
              className={`${styles.filterBtn} ${filter === s ? styles.filterBtnActive : ''}`}
              onClick={() => setFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>

        <div className={styles.searchContainer}>
          <SearchIcon size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder={t('candidates.searchPlaceholder')}
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.exportDropdown}>
           <button className={styles.actionBtn} style={{ background: 'var(--surface)', color: 'var(--text-primary)' }}>
              <Download size={18} />
              {t('candidates.export')}
           </button>
           <div className={styles.dropdownContent}>
              <button onClick={() => handleExport('excel')} className={styles.dropdownItem}>
                <FileSpreadsheet size={16} /> Excel
              </button>
              <button onClick={() => handleExport('pdf')} className={styles.dropdownItem}>
                <FilePdf size={16} /> PDF
              </button>
           </div>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={8} />
      ) : (
        <AnimatePresence mode="wait">
          {viewMode === 'list' ? (
            <motion.div 
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={styles.tableContainer}
            >
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>
                      <div 
                        className={`${styles.checkbox} ${selectedIds.length === filteredCandidates.length && filteredCandidates.length > 0 ? styles.checkboxActive : ''}`}
                        onClick={toggleSelectAll}
                      />
                    </th>
                    <th>{t('candidates.table.fullName')}</th>
                    <th>{t('candidates.table.status')}</th>
                    <th>{t('candidates.table.vacancy')}</th>
                    <th>{t('candidates.table.region')}</th>
                    <th>{t('candidates.table.stage')}</th>
                    <th>{t('candidates.table.submitted')}</th>
                    <th style={{ textAlign: 'right' }}>{t('candidates.table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.map((c) => (
                    <tr key={c.id} className={styles.tableRow}>
                      <td>
                        <div 
                          className={`${styles.checkbox} ${selectedIds.includes(c.id) ? styles.checkboxActive : ''}`}
                          onClick={() => toggleSelect(c.id)}
                        />
                      </td>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.avatar}>{c.firstName[0]}{c.lastName[0]}</div>
                          <span className={styles.userName}>{c.firstName} {c.lastName}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${c.status.toLowerCase()}`}>
                          {c.status}
                        </span>
                      </td>
                      <td>{c.vacancyTitle}</td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{c.region || t('n/a') || 'N/A'}</span>
                      </td>
                      <td>
                        <span className="badge badge-passed">{c.stage}</span>
                      </td>
                      <td>{new Date(c.appliedAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <Link href={`/dashboard/hr/candidates/${c.id}`} className={styles.iconBtn}>
                            <Eye size={16} />
                          </Link>
                          <button className={styles.iconBtn} onClick={() => setMsgModal({ open: true, candidateId: c.id })}>
                            <MessageSquare size={16} />
                          </button>
                          <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => handleDelete(c.id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredCandidates.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-light)' }}>
                         {t('candidates.emptyState')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </motion.div>
          ) : (
            <motion.div 
              key="kanban"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragEnd={handleDragEnd}
              >
                <div className={styles.kanbanBoard}>
                  {STATUS_OPTIONS.map(status => {
                    const colCandidates = filteredCandidates.filter(c => c.status === status);
                    return (
                      <KanbanColumn 
                        key={status} 
                        id={status} 
                        title={status} 
                        candidates={colCandidates}
                        onAction={(id) => setMsgModal({ open: true, candidateId: id })}
                      />
                    );
                  })}
                </div>
              </DndContext>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Bulk Actions Panel */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ y: 100, x: '-50%', opacity: 0 }}
            animate={{ y: 0, x: '-50%', opacity: 1 }}
            exit={{ y: 100, x: '-50%', opacity: 0 }}
            className={styles.bulkActions}
          >
            <div className={styles.bulkInfo}>
              <CheckSquare size={20} color="var(--primary)" />
              {selectedIds.length} {t('candidates.title')} Selected
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
               <div style={{ position: 'relative' }}>
                  <button className={styles.bulkBtn}>
                    Status <ChevronDown size={14} />
                  </button>
                  {/* Simplistic Status Dropup */}
                  <div style={{ position: 'absolute', bottom: '100%', left: 0, background: 'var(--surface)', borderRadius: '12px', padding: '0.5rem', width: '150px', boxShadow: '0 -10px 20px rgba(0,0,0,0.1)', display: 'none' }}>
                    {STATUS_OPTIONS.map(s => <button key={s} onClick={() => handleBulkStatusUpdate(s)} className={styles.dropdownItem}>{s}</button>)}
                  </div>
               </div>
               <button className={styles.bulkBtn} onClick={() => handleBulkDelete()}>
                  <Trash2 size={16} /> Delete
               </button>
               <button className={styles.bulkBtn} style={{ background: 'var(--primary)', border: 'none' }} onClick={() => setSelectedIds([])}>
                  Cancel
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Modal */}
      <AnimatePresence>
        {msgModal.open && (
          <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.7)', zIndex: 2000 }}>
             <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="card-glass"
              style={{ width: '400px', padding: '2rem' }}
             >
                <h3 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>{t('candidatesModule.messageModal.title')}</h3>
                <textarea 
                  className="input-premium"
                  placeholder={t('candidatesModule.messageModal.placeholder')}
                  style={{ height: '150px', marginBottom: '1.5rem' }}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
                <div style={{ display: 'flex', gap: '1rem' }}>
                   <button className="btn-glass" style={{ flex: 1 }} onClick={() => setMsgModal({ open: false, candidateId: null })}>
                      {t('cancel')}
                   </button>
                   <button className="btn-primary" style={{ flex: 1 }} onClick={handleSendMessage}>
                      <Send size={18} />
                      {t('candidatesModule.messageModal.send')}
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Candidate Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay" style={{ zIndex: 1500 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{ position: 'relative', width: '100%', maxWidth: '800px' }}
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="icon-btn"
                style={{ position: 'absolute', top: '-1rem', right: '-1rem', zIndex: 1501 }}
              >
                <X size={20} />
              </button>
              <MultiStepApplicationForm 
                onSuccess={() => {
                  setIsModalOpen(false);
                  fetchCandidates();
                }}
                onCancel={() => setIsModalOpen(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function KanbanColumn({ id, title, candidates, onAction }: { id: string; title: string; candidates: CandidateType[]; onAction: (id: string) => void }) {
  const { setNodeRef } = useDroppable({ id });
  
  return (
    <div ref={setNodeRef} className={styles.kanbanColumn}>
       <div className={styles.columnHeader}>
          <span className={styles.columnTitle}>{title}</span>
          <span className={styles.columnCount}>{candidates.length}</span>
       </div>
       <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
          <SortableContext items={candidates.map(c => c.id)} strategy={verticalListSortingStrategy}>
            {candidates.map(c => (
              <SortableCard key={c.id} candidate={c} onAction={onAction} />
            ))}
          </SortableContext>
          {candidates.length === 0 && (
            <div style={{ padding: '2rem', border: '2px dashed rgba(0,0,0,0.05)', borderRadius: '16px', textAlign: 'center', fontSize: '0.7rem', color: '#94a3b8' }}>
               Drop here
            </div>
          )}
       </div>
    </div>
  );
}

function SortableCard({ candidate, onAction }: { candidate: CandidateType; onAction: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: candidate.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners} 
      className={styles.kanbanCard}
    >
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div className={styles.cardAvatar}>
             {candidate.firstName[0]}{candidate.lastName[0]}
          </div>
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAction(candidate.id); }} 
            className="icon-btn" 
            style={{ width: '24px', height: '24px' }}
          >
             <MoreVertical size={14} />
          </button>
       </div>
       <div className={styles.cardTitle}>{candidate.firstName} {candidate.lastName}</div>
       <div className={styles.cardSubtitle}>{candidate.vacancyTitle}</div>
       <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <Link 
            href={`/dashboard/hr/candidates/${candidate.id}`} 
            className="btn-glass" 
            style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', borderRadius: '6px' }}
            onPointerDown={(e) => e.stopPropagation()} // Prevent drag when clicking link
          >
            Profile
          </Link>
          <div className="badge badge-passed" style={{ fontSize: '0.65rem' }}>{candidate.stage}</div>
       </div>
    </div>
  );
}
