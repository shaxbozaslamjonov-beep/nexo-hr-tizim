'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { lessonService } from '@/lib/services/lessonService';
import { useSearch } from '@/contexts/SearchContext';
import { Lesson, Assignment } from '@/types';
import { ClipboardList, CheckCircle, Clock, BookOpen, ExternalLink, Filter, Calendar } from 'lucide-react';
import Link from 'next/link';
import styles from '@/components/lessons/lessons.module.css';

// Extending standard interface slightly to match DB fields
interface DBAssignment {
  id: string;
  lessonId: string;
  employeeId: string;
  employee?: { id: string; firstName: string; lastName: string; photoUrl?: string };
  status: string;
  dueDate: string | null;
  submittedAt: string | null;
  score: number | null;
  submissionText: string | null;
  fileUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function MyAssignmentsPage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  
  const [assignments, setAssignments] = useState<DBAssignment[]>([]);
  const [lessons, setLessons] = useState<Record<string, Lesson>>({});
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const { searchQuery, setSearchQuery } = useSearch();
  const [sortOrder, setSortOrder] = useState<string>('newest');

  // Clear search on unmount or when leaving specific pages (optional but good for consistency)
  useEffect(() => {
    return () => setSearchQuery('');
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assignmentsRes, lessonData] = await Promise.all([
          // For HR, we fetch all. We can later filter by role.
          fetch(`/api/lessons/assignments`),
          lessonService.getLessons()
        ]);
        
        let assignmentsData = [];
        if (assignmentsRes.ok) {
           assignmentsData = await assignmentsRes.json();
        }

        setAssignments(assignmentsData);
        
        const lessonMap: Record<string, Lesson> = {};
        lessonData.forEach(l => {
          lessonMap[l.id] = l;
        });
        setLessons(lessonMap);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  const handleQuickStatusChange = async (assignmentId: string, currentStatus: string) => {
    if (currentStatus === 'SUBMITTED' || currentStatus === 'DONE') return;
    
    setUpdatingId(assignmentId);
    try {
      const res = await fetch(`/api/lessons/assignments/${assignmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DONE' })
      });
      if (res.ok) {
        setAssignments(prev => 
          prev.map(a => a.id === assignmentId ? { ...a, status: 'DONE', submittedAt: new Date().toISOString() } : a)
        );
      }
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getLessonType = (lesson: Lesson) => {
    if (!lesson) return 'practical';
    if (lesson.videoUrl) return 'video';
    if (lesson.fileAttachment?.name.endsWith('.pdf')) return 'pdf';
    return 'practical';
  };

  // Filter and Sort logic
  const filteredAssignments = assignments.filter((a) => {
    const lesson = lessons[a.lessonId];
    if (!lesson) return true;
    
    const title = lesson.title[language] || lesson.title['ru'] || '';
    if (searchQuery && !title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    if (statusFilter && a.status !== statusFilter && !(statusFilter === 'DONE' && a.status === 'SUBMITTED')) return false;
    
    if (typeFilter) {
      const lType = getLessonType(lesson);
      if (lType !== typeFilter) return false;
    }
    
    return true;
  }).sort((a, b) => {
    if (sortOrder === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortOrder === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortOrder === 'due_soon' && a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    return 0;
  });

  return (
    <div className="page-container bg-background text-foreground min-h-screen p-6">
      <div className="page-header" style={{ marginBottom: '2.5rem' }}>
        <h1 className="page-title text-foreground" style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{ background: 'var(--grad-primary)', padding: '0.5rem', borderRadius: '12px', display: 'flex', color: 'white' }}>
            <ClipboardList size={28} />
          </div>
          {t('lessonAssignments') || 'O\'quv topshiriqlari'}
        </h1>
        <p className="text-muted-foreground" style={{ fontSize: '1.1rem' }}>Xodimlarga biriktirilgan darslar va ularning bajarilish holatini kuzatish</p>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className={styles.card} style={{ height: '100px', animation: 'pulse 1.5s infinite', background: 'hsl(var(--muted))' }} />
          ))}
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="bg-muted/50 p-16 rounded-3xl text-center border border-border">
          <BookOpen size={48} className="text-muted-foreground mx-auto mb-6" />
          <h2 className="text-foreground text-xl font-semibold mb-2">No assignments found</h2>
          <p className="text-muted-foreground mb-8">Adjust your filters or start exploring new lessons.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {filteredAssignments.map((assignment) => {
            const lesson = lessons[assignment.lessonId];
            if (!lesson) return null;
            
            const title = lesson.title[language] || lesson.title['ru'] || 'Untitled Lesson';
            
            const lessonType = getLessonType(lesson);
            let typeClass = "bg-green-50 text-green-600 border border-green-100";
            if (lessonType === 'video') typeClass = "bg-blue-50 text-blue-600 border border-blue-100";
            if (lessonType === 'pdf') typeClass = "bg-orange-50 text-orange-600 border border-orange-100";
            
            // Status mappings
            let statusLabel: string = assignment.status;
            let statusClass = "bg-orange-50 text-orange-600 border border-orange-100";
            let statusIcon = <Clock size={14} className="mr-2" />;
            
            if (assignment.status === 'SUBMITTED' || assignment.status === 'DONE' || assignment.status === 'CHECKED') {
              statusLabel = t('statusChecked') || 'Bajarilgan';
              statusClass = "bg-green-50 text-green-700 border border-green-100";
              statusIcon = <CheckCircle size={14} className="mr-2" />;
            } else if (assignment.status === 'IN_PROGRESS') {
              statusLabel = 'Jarayonda';
              statusClass = "bg-blue-50 text-blue-700 border border-blue-100";
              statusIcon = <Clock size={14} className="mr-2" />;
            } else if (assignment.status === 'OVERDUE') {
              statusLabel = 'Muddati o\'tgan';
              statusClass = "bg-red-50 text-red-700 border border-red-100";
              statusIcon = <Clock size={14} className="mr-2" />;
            } else {
              statusLabel = 'Kutilmoqda';
            }

            const isCompleted = ['SUBMITTED', 'DONE', 'CHECKED'].includes(assignment.status);
            
            return (
              <div key={assignment.id} className="flex items-center justify-between p-5 bg-card border border-border rounded-xl shadow-sm gap-6 hover:shadow-md transition-shadow">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1, opacity: isCompleted ? 0.85 : 1 }}>
                  
                  {/* Quick Status Toggle */}
                  <div onClick={() => handleQuickStatusChange(assignment.id, assignment.status)} style={{ cursor: isCompleted ? 'default' : 'pointer' }}>
                    {updatingId === assignment.id ? (
                      <div className="w-6 h-6 rounded-full border-2 border-muted border-t-primary animate-spin" />
                    ) : (
                      <CheckCircle size={24} className={isCompleted ? 'text-green-500' : 'text-muted-foreground'} />
                    )}
                  </div>

                  <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Link href={`/dashboard/hr/lessons/assignments/${assignment.id}`} style={{ textDecoration: 'none' }}>
                        <h3 className="text-foreground font-bold text-lg m-0 hover:text-primary transition-colors" style={{ textDecoration: isCompleted ? 'line-through' : 'none' }}>
                          {title}
                        </h3>
                      </Link>
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wide inline-flex items-center gap-1 ${typeClass}`}>
                        {lessonType}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-light)', fontSize: '0.875rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                      {assignment.employee && (
                         <span className="flex items-center gap-1.5 font-medium text-slate-700">
                           <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                             {assignment.employee.firstName[0]}{assignment.employee.lastName[0]}
                           </div>
                           {assignment.employee.firstName} {assignment.employee.lastName}
                         </span>
                      )}
                      {assignment.dueDate && (
                        <span className={`flex items-center gap-1.5 ${new Date(assignment.dueDate) < new Date() && !isCompleted ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                          <Calendar size={14} /> Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      {assignment.submittedAt && (
                        <span className="text-muted-foreground text-sm">Submitted: {new Date(assignment.submittedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  <div className={`px-4 py-1.5 rounded-full text-sm font-semibold inline-flex items-center m-0 ${statusClass}`}>
                    {statusIcon}
                    {statusLabel}
                  </div>
                  
                  <Link href={`/dashboard/hr/lessons/assignments/${assignment.id}`} className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-theme hover:translate-x-1">
                    Details <ExternalLink size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .page-container {
          animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}

