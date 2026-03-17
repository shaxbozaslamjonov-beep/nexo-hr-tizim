'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Mail, 
  Calendar,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  X,
  Search,
  Filter,
  Video,
  UserCircle
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface OnboardingTask {
  id: string;
  title: string;
  description: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  dueDate: string | null;
}

interface Position {
  id: string;
  title: string;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  positionRef?: Position | null;
}

interface Mentor {
  firstName: string;
  lastName: string;
  position: string;
  email?: string | null;
}

interface Meeting {
  id: string;
  title: string;
  description?: string | null;
  dateTime: string;
  joinUrl?: string | null;
}

type TaskFilter = 'ALL' | 'PENDING' | 'COMPLETED';

export default function OnboardingPage() {
  const { t } = useLanguage();
  const { user, isAdmin } = useAuth();
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter & search
  const [filter, setFilter] = useState<TaskFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<OnboardingTask | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', dueDate: '', employeeId: '', positionId: '' });

  useEffect(() => {
    if (user) {
      if (isAdmin) {
        fetchEmployees();
        fetchPositions();
      } else {
        setSelectedEmployeeId(user.id);
      }
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (selectedEmployeeId) {
      fetchInitialData(selectedEmployeeId);
    }
  }, [selectedEmployeeId]);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      if (Array.isArray(data)) {
        setEmployees(data);
        if (data.length > 0 && !selectedEmployeeId) {
          setSelectedEmployeeId(data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const fetchPositions = async () => {
    try {
      const res = await fetch('/api/positions');
      const data = await res.json();
      if (Array.isArray(data)) {
        setPositions(data);
      }
    } catch (error) {
      console.error('Failed to fetch positions:', error);
    }
  };

  const fetchInitialData = async (empId: string) => {
    setLoading(true);
    try {
      // Fetch tasks
      const tasksRes = await fetch(`/api/onboarding/tasks?employeeId=${empId}`);
      const tasksData = await tasksRes.json();
      if (Array.isArray(tasksData)) setTasks(tasksData);

      // Fetch mentor
      try {
        const mentorRes = await fetch(`/api/onboarding/mentor?employeeId=${empId}`);
        const mentorData = await mentorRes.json();
        if (mentorData && mentorData.firstName) {
          setMentor(mentorData);
        } else {
          setMentor({ firstName: 'Dilshod', lastName: 'Akramov', position: 'Senior IT Specialist' });
        }
      } catch {
        setMentor({ firstName: 'Dilshod', lastName: 'Akramov', position: 'Senior IT Specialist' });
      }

      // Fetch meeting
      try {
        const meetingRes = await fetch(`/api/onboarding/meetings?employeeId=${empId}`);
        const meetingData = await meetingRes.json();
        if (meetingData && meetingData.id) {
          setMeeting(meetingData);
        } else {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(10, 0, 0, 0);
          setMeeting({
            id: 'mock-meeting',
            title: 'Team Sync',
            dateTime: tomorrow.toISOString(),
            joinUrl: 'https://meet.google.com/example',
          });
        }
      } catch {
        setMeeting(null);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load onboarding data.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      const res = await fetch('/api/onboarding/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });
      if (res.ok) {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus as any } : t));
        toast.success(newStatus === 'COMPLETED' ? (t('onboardingPage.completed') as string) || 'Task completed!' : 'Task reopened');
      } else {
        toast.error('Failed to update task status');
      }
    } catch {
      toast.error('Network error');
    }
  };

  const handleDeleteTask = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm((t('onboardingPage.deleteConfirm') as string) || 'Are you sure you want to delete this task?')) return;
    try {
      const res = await fetch(`/api/onboarding/tasks?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTasks(tasks.filter(t => t.id !== id));
        toast.success('Task deleted successfully');
      } else {
        toast.error('Failed to delete task');
      }
    } catch {
      toast.error('Network error');
    }
  };

  const openModal = (task?: OnboardingTask) => {
    if (task) {
      setEditingTask(task);
      setFormData({ 
        title: task.title, 
        description: task.description || '', 
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        employeeId: selectedEmployeeId,
        positionId: (task as any).positionId || ''
      });
    } else {
      setEditingTask(null);
      setFormData({ title: '', description: '', dueDate: '', employeeId: selectedEmployeeId, positionId: '' });
    }
    setIsModalOpen(true);
  };

  const saveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId) return;
    try {
      if (editingTask) {
        const res = await fetch('/api/onboarding/tasks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingTask.id, ...formData })
        });
        if (res.ok) {
          const updatedTask = await res.json();
          setTasks(tasks.map(t => t.id === editingTask.id ? updatedTask : t));
          toast.success((t('onboardingPage.saveChanges') as string) || 'Task updated successfully');
        } else {
          toast.error('Failed to update task');
        }
      } else {
        const res = await fetch('/api/onboarding/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, employeeId: formData.employeeId || selectedEmployeeId })
        });
        if (res.ok) {
          const newTask = await res.json();
          setTasks([...tasks, newTask]);
          toast.success((t('onboardingPage.createTask') as string) || 'Task created successfully');
        } else {
          toast.error('Failed to create task');
        }
      }
      setIsModalOpen(false);
    } catch {
      toast.error('Network error while saving');
    }
  };

  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (filter === 'PENDING') result = result.filter(t => t.status !== 'COMPLETED');
    if (filter === 'COMPLETED') result = result.filter(t => t.status === 'COMPLETED');
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q)));
    }
    return result;
  }, [tasks, filter, searchQuery]);

  const isDueSoon = (dueDate: string | null) => {
    if (!dueDate) return false;
    const diff = new Date(dueDate).getTime() - Date.now();
    return diff > 0 && diff < 2 * 24 * 60 * 60 * 1000; // less than 2 days
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate).getTime() < Date.now();
  };

  const formatMeetingDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (d.toDateString() === now.toDateString()) return `Today at ${timeStr}`;
    if (d.toDateString() === tomorrow.toDateString()) return `Tomorrow at ${timeStr}`;
    return `${d.toLocaleDateString()} at ${timeStr}`;
  };

  const filterBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.4rem 1rem',
    borderRadius: '8px',
    border: 'none',
    fontWeight: 600,
    fontSize: '0.8rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: active ? '#4f46e5' : '#f1f5f9',
    color: active ? 'white' : '#64748b',
  });

  return (
    <div className="animate-fade-in" style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem', gap: '2rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.6rem', background: 'linear-gradient(135deg, #FF3CAC 0%, #784BA0 50%, #2B86C5 100%)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(120, 75, 160, 0.3)' }}>
              <Rocket size={24} color="white" />
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>{t('onboarding')}</h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>{t('onboardingPage.welcome')}</p>
          
          {isAdmin && (
            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label style={{ fontWeight: 700, color: '#475569', fontSize: '0.9rem' }}>Select Employee:</label>
              <select 
                value={selectedEmployeeId} 
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                style={{ padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', outline: 'none', minWidth: '250px', fontWeight: 600 }}
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.positionRef?.title || emp.position})</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {isAdmin && (
            <button 
              onClick={() => openModal()} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                padding: '0.75rem 1.5rem', 
                background: 'var(--primary)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '12px', 
                fontWeight: 700, 
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Plus size={20} /> {(t('onboardingPage.createTask') as string) || 'Vazifa yaratish'}
            </button>
          )}

          {/* Progress (moved slightly or kept alongside) */}
          <div style={{ textAlign: 'right', minWidth: '150px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
              {t('onboardingPage.progress')}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <div style={{ width: '100px', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)' }}
                />
              </div>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>{Math.round(progress)}%</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2.5rem' }}>
        {/* Left: Task list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
            {/* Header with filters */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
               <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{t('onboardingPage.checklist')}</h2>
            </div>

            {/* Filter bar */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => setFilter('ALL')} style={filterBtnStyle(filter === 'ALL')}>{t('onboardingPage.all')}</button>
              <button onClick={() => setFilter('PENDING')} style={filterBtnStyle(filter === 'PENDING')}>{t('onboardingPage.pending')}</button>
              <button onClick={() => setFilter('COMPLETED')} style={filterBtnStyle(filter === 'COMPLETED')}>{t('onboardingPage.completed')}</button>
              <div style={{ flex: 1 }} />
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  placeholder={(t('onboardingPage.search') as string) || 'Search tasks...'} 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ padding: '0.4rem 0.75rem 0.4rem 2rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.85rem', width: '200px' }} 
                />
              </div>
            </div>
            
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>{t('onboardingPage.loading')}</div>
            ) : filteredTasks.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ color: '#94a3b8', marginBottom: '1rem' }}>
                  {tasks.length === 0 ? t('onboardingPage.noTasks') : 'No matching tasks found.'}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <AnimatePresence>
                  {filteredTasks.map((task) => (
                    <motion.div 
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => toggleTask(task.id, task.status)}
                      style={{ 
                        padding: '1.25rem', 
                        borderRadius: '16px', 
                        background: task.status === 'COMPLETED' ? '#f8fafc' : 'white',
                        border: '1px solid',
                        borderColor: isOverdue(task.dueDate) && task.status !== 'COMPLETED' ? '#fca5a5' : isDueSoon(task.dueDate) && task.status !== 'COMPLETED' ? '#fde68a' : task.status === 'COMPLETED' ? '#e2e8f0' : '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: task.status === 'COMPLETED' ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)'
                      }}
                      whileHover={{ x: 3, borderColor: '#cbd5e1' }}
                    >
                      {task.status === 'COMPLETED' ? (
                        <div style={{ color: '#10b981' }}><CheckCircle2 size={24} /></div>
                      ) : (
                        <div style={{ color: '#cbd5e1' }}><Circle size={24} /></div>
                      )}
                      <div style={{ flex: 1 }}>
                        <h3 style={{ 
                          fontSize: '1rem', 
                          fontWeight: 600, 
                          color: task.status === 'COMPLETED' ? '#94a3b8' : '#1e293b',
                          textDecoration: task.status === 'COMPLETED' ? 'line-through' : 'none',
                          margin: 0
                        }}>
                          {task.title}
                        </h3>
                        {task.description && <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.25rem 0 0 0' }}>{task.description}</p>}
                      </div>
                      
                      {task.dueDate && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: isOverdue(task.dueDate) && task.status !== 'COMPLETED' ? '#ef4444' : isDueSoon(task.dueDate) && task.status !== 'COMPLETED' ? '#f59e0b' : '#94a3b8', fontSize: '0.8rem', marginRight: '1rem', fontWeight: 600 }}>
                          <Clock size={14} />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}
                      
                      {isAdmin && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                           <button onClick={(e) => { e.stopPropagation(); openModal(task); }} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.25rem', transition: 'color 0.2s' }} onMouseOver={e => (e.currentTarget.style.color = '#4f46e5')} onMouseOut={e => (e.currentTarget.style.color = '#94a3b8')}>
                              <Edit2 size={16} />
                           </button>
                           <button onClick={(e) => handleDeleteTask(task.id, e)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.25rem', transition: 'color 0.2s' }} onMouseOver={e => (e.currentTarget.style.color = '#ef4444')} onMouseOut={e => (e.currentTarget.style.color = '#94a3b8')}>
                              <Trash2 size={16} />
                           </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Right: Mentor + Meeting */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Mentor Card */}
          <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('onboardingPage.mentor')}
            </h2>
            {mentor ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'linear-gradient(135deg, #e0e7ff, #f1f5f9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserCircle size={36} color="#4f46e5" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>{mentor.firstName} {mentor.lastName}</h3>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>{mentor.position}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <a 
                    href={mentor.email ? `mailto:${mentor.email}` : '#'} 
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', width: '100%', padding: '0.75rem 1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#475569', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'none', transition: 'all 0.2s' }}
                    onMouseOver={e => { e.currentTarget.style.background = '#e0e7ff'; e.currentTarget.style.borderColor = '#4f46e5'; }}
                    onMouseOut={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                  >
                    <Mail size={16} /> {t('onboardingPage.writeEmail')}
                  </a>
                </div>
              </>
            ) : (
              <p style={{ color: '#94a3b8' }}>{t('onboardingPage.noMentor')}</p>
            )}
          </div>

          {/* Meeting Card */}
          <div style={{ padding: '2rem', borderRadius: '24px', background: 'linear-gradient(135deg, #FF9A8B 0%, #FF6A88 55%, #FF99AC 100%)', color: 'white' }}>
            <Calendar size={32} style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>{t('onboardingPage.internalMeet')}</h3>
            {meeting ? (
              <>
                <p style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem' }}>{meeting.title}</p>
                <p style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '1.5rem' }}>
                  {formatMeetingDate(meeting.dateTime)}
                </p>
                {meeting.joinUrl ? (
                  <a 
                    href={meeting.joinUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'white', color: '#FF6A88', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'none', transition: 'transform 0.2s' }}
                    onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    <Video size={16} /> {t('onboardingPage.joinVideo')} <ChevronRight size={16} />
                  </a>
                ) : (
                  <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>No link available</span>
                )}
              </>
            ) : (
              <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>{t('onboardingPage.noMeeting')}</p>
            )}
          </div>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
            onClick={() => setIsModalOpen(false)}
          >
             <motion.div
               initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
               onClick={e => e.stopPropagation()}
               style={{ background: 'white', padding: '2rem', borderRadius: '24px', width: '90%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
             >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                   <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
                     {editingTask ? t('onboardingPage.editTask') : t('onboardingPage.newTask')}
                   </h2>
                   <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', transition: 'color 0.2s' }} onMouseOver={e => (e.currentTarget.style.color = '#1e293b')} onMouseOut={e => (e.currentTarget.style.color = '#94a3b8')}>
                     <X size={24}/>
                   </button>
                </div>

                <form onSubmit={saveTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>{t('onboardingPage.title')} *</label>
                     <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', transition: 'border-color 0.2s' }} onFocus={e => (e.target.style.borderColor = '#4f46e5')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} placeholder="e.g. Set up laptop" />
                   </div>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>{t('onboardingPage.description')}</label>
                     <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', minHeight: '80px', fontFamily: 'inherit', transition: 'border-color 0.2s' }} onFocus={e => (e.target.style.borderColor = '#4f46e5')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} placeholder="Detailed instructions..." />
                   </div>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>{t('onboardingPage.dueDate')}</label>
                     <input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} />
                   </div>

                   {isAdmin && (
                     <div>
                       <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Assigned To *</label>
                       <select 
                         required
                         value={formData.employeeId} 
                         onChange={e => setFormData({...formData, employeeId: e.target.value})}
                         style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', background: 'white' }}
                       >
                         <option value="">Select Employee</option>
                         {employees.map(emp => (
                           <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                         ))}
                       </select>
                     </div>
                   )}

                   {isAdmin && (
                     <div>
                       <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Relates to Position (Optional)</label>
                       <select 
                         value={formData.positionId} 
                         onChange={e => setFormData({...formData, positionId: e.target.value})}
                         style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', background: 'white' }}
                       >
                         <option value="">General Task</option>
                         {positions.map(pos => (
                           <option key={pos.id} value={pos.id}>{pos.title}</option>
                         ))}
                       </select>
                     </div>
                   )}

                   <button type="submit" disabled={!formData.title || (isAdmin && !formData.employeeId)} style={{ marginTop: '1rem', width: '100%', padding: '0.875rem', background: (formData.title && (!isAdmin || formData.employeeId)) ? '#4f46e5' : '#cbd5e1', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: (formData.title && (!isAdmin || formData.employeeId)) ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>
                      {editingTask ? t('onboardingPage.saveChanges') : t('onboardingPage.createTask')}
                   </button>
                </form>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
