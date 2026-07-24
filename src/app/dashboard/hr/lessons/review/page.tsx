'use client';

import React, { useEffect, useState } from 'react';
import { lessonService } from '@/lib/services/lessonService';
import { Lesson, Assignment } from '@/types';
import {
  CheckCircle2,
  Clock,
  Search,
  BookOpen,
  User as UserIcon,
  Award,
  FileText,
  TrendingUp,
  ClipboardList,
  ExternalLink,
  MessageSquare,
  Paperclip,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import fx from '@/components/analytics/effects.module.css';

export default function AssignmentReviewPage() {
  const { language } = useLanguage();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'SUBMITTED' | 'CHECKED'>('SUBMITTED');
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [grade, setGrade] = useState<number>(100);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assignData, lessonData] = await Promise.all([
          lessonService.getAssignments(),
          lessonService.getLessons(),
        ]);
        setAssignments(assignData);
        setLessons(lessonData);
      } catch (err) {
        console.error('Error fetching assignments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleGrade = async (id: string) => {
    try {
      await lessonService.gradeAssignment(id, grade);
      const updated = await lessonService.getAssignments();
      setAssignments(updated);
      setGradingId(null);
    } catch (err) {
      console.error('Error grading:', err);
    }
  };

  const displayed = assignments.filter((a) => {
    const matchesFilter = filter === 'ALL' || a.status === filter;
    const matchesSearch =
      searchQuery === '' ||
      ((a as any).employee?.firstName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      ((a as any).employee?.lastName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.userId || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const submittedCount = assignments.filter((a) => a.status === 'SUBMITTED').length;
  const checkedCount = assignments.filter((a) => a.status === 'CHECKED').length;
  const recentCount = assignments.filter(
    (a) => a.submittedAt && new Date(a.submittedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  const stats = [
    {
      label: 'Jami yuborilgan',
      value: assignments.length,
      trend: `So'nggi 7 kun: +${recentCount}`,
      icon: FileText,
      iconBg: '#eff6ff',
      iconColor: '#2563eb',
    },
    {
      label: 'Kutilmoqda',
      value: submittedCount,
      trend: submittedCount > 0 ? `${submittedCount} ta javob kutmoqda` : 'Hammasi ko\'rib chiqilgan',
      icon: Clock,
      iconBg: '#fff7ed',
      iconColor: '#ea580c',
    },
    {
      label: 'Tekshirilgan',
      value: checkedCount,
      trend: assignments.length > 0 ? `${Math.round((checkedCount / assignments.length) * 100)}% yakunlangan` : '—',
      icon: CheckCircle2,
      iconBg: '#f0fdf4',
      iconColor: '#16a34a',
    },
  ];

  const cardStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.6rem 0.9rem',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    color: '#0d1b3d',
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div className={fx.fadeInUp} style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1.25rem', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'linear-gradient(135deg, #0d1b3d 0%, #2e4ba8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px -8px rgba(13, 27, 61, 0.4)', flexShrink: 0 }}>
          <ClipboardList size={26} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0d1b3d', margin: 0, letterSpacing: '-0.02em' }}>
            Topshiriqlarni tekshirish
          </h1>
          <p style={{ color: '#64748b', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
            Xodimlarning bajarilgan topshiriqlarini tekshiring va baholang
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className={`${fx.fadeInUp} ${fx.delay1}`} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        {stats.map((stat, i) => (
          <div key={i} className={fx.hoverLift} style={{ ...cardStyle, padding: '1.5rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{stat.label}</p>
              <h3 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0d1b3d', margin: '0.5rem 0' }}>{stat.value}</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                <TrendingUp size={12} color="#16a34a" /> {stat.trend}
              </p>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '14px', background: stat.iconBg, color: stat.iconColor, display: 'flex' }}>
              <stat.icon size={22} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className={`${fx.fadeInUp} ${fx.delay2}`} style={{ ...cardStyle, background: '#f8fafc', padding: '1rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.35rem', padding: '0.3rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          {[
            { id: 'ALL', label: 'Barchasi' },
            { id: 'SUBMITTED', label: 'Yangi' },
            { id: 'CHECKED', label: 'Tekshirilgan' },
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setFilter(s.id as any)}
              style={{
                padding: '0.5rem 1.1rem',
                borderRadius: '9px',
                fontSize: '0.85rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: filter === s.id ? '#0d1b3d' : 'transparent',
                color: filter === s.id ? 'white' : '#64748b',
                transition: 'all 0.2s',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            placeholder="Xodim bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ ...inputStyle, paddingLeft: '2.5rem', background: 'white' }}
          />
        </div>
      </div>

      {/* Assignment cards grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ ...cardStyle, height: '18rem', background: '#f1f5f9', border: 'none' }} />
          ))}
        </div>
      ) : (
        <div className={`${fx.fadeInUp} ${fx.delay3}`} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {displayed.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', ...cardStyle, border: '1px dashed #cbd5e1', padding: '4rem 2rem', textAlign: 'center' }}>
              <BookOpen size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0d1b3d', margin: 0 }}>Hozircha topshiriqlar yo'q</h2>
              <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Sizda hali tekshirilishi kerak bo'lgan topshiriqlar mavjud emas.</p>
            </div>
          ) : (
            displayed.map((a) => {
              const lesson = lessons.find((l) => l.id === a.lessonId);
              const employee = (a as any).employee;
              const isChecked = a.status === 'CHECKED';
              return (
                <div key={a.id} className={fx.hoverLift} style={{ ...cardStyle, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <div style={{ padding: '0.4rem', borderRadius: '8px', background: '#eff6ff', display: 'flex' }}>
                          <BookOpen size={14} color="#2563eb" />
                        </div>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8' }}>
                          O'quv kursi topshirig'i
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0d1b3d', margin: 0, lineHeight: 1.3, minHeight: '2.6rem' }}>
                        {lesson?.title?.[language] || lesson?.title?.['ru'] || 'Sarlavhasiz dars'}
                      </h3>
                    </div>

                    <div style={{ borderRadius: '14px', border: '1px solid #f1f5f9', background: '#f8fafc', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 0.9rem', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Xodim</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '999px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: '#2563eb' }}>
                            {(employee?.firstName || a.userId || '?')[0]}
                          </div>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0d1b3d' }}>
                            {employee ? `${employee.firstName} ${employee.lastName}` : a.userId || 'ID: ---'}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 0.9rem', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Sana</span>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0d1b3d' }}>
                          {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : '---'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 0.9rem', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Baho</span>
                        {isChecked ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0d1b3d' }}>{a.grade}/100</span>
                            <div style={{ width: '48px', height: '5px', borderRadius: '999px', background: '#e2e8f0', overflow: 'hidden' }}>
                              <div style={{ height: '100%', background: '#16a34a', width: `${a.grade}%` }} />
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '999px', background: '#ffedd5', color: '#c2410c' }}>
                            Kutilmoqda
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 0.9rem' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Holat</span>
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            padding: '0.2rem 0.6rem',
                            borderRadius: '999px',
                            textTransform: 'uppercase',
                            background: isChecked ? '#dcfce7' : '#dbeafe',
                            color: isChecked ? '#15803d' : '#1d4ed8',
                          }}
                        >
                          {isChecked ? '✓ Tekshirilgan' : '● Yangi'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
                        <MessageSquare size={12} /> Xodim javobi
                      </span>
                      <div style={{ padding: '0.75rem 0.9rem', borderRadius: '10px', borderLeft: '3px solid #bfdbfe', background: '#f8fafc', fontSize: '0.8rem', color: '#475569', fontStyle: 'italic', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
                        "{a.submissionText || 'Javob matni mavjud emas'}"
                      </div>
                      {a.fileUrl && (
                        <a
                          href={a.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ marginTop: '0.6rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}
                        >
                          <Paperclip size={13} /> Biriktirilgan faylni ochish
                        </a>
                      )}
                    </div>
                  </div>

                  <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #f1f5f9', background: '#fbfdff' }}>
                    {a.status === 'SUBMITTED' ? (
                      gradingId === a.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <div>
                            <label style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>
                              Ball belgilang (0-100)
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={grade}
                              onChange={(e) => setGrade(Number(e.target.value))}
                              style={{ ...inputStyle, textAlign: 'center', fontSize: '1.1rem', fontWeight: 800 }}
                            />
                          </div>
                          <div style={{ display: 'flex', gap: '0.6rem' }}>
                            <button
                              type="button"
                              onClick={() => handleGrade(a.id)}
                              style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', border: 'none', background: '#0d1b3d', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                            >
                              Saqlash
                            </button>
                            <button
                              type="button"
                              onClick={() => setGradingId(null)}
                              style={{ padding: '0.65rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                            >
                              Bekor
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '0.6rem' }}>
                          <a
                            href={a.fileUrl || '#'}
                            target={a.fileUrl ? '_blank' : undefined}
                            rel="noopener noreferrer"
                            style={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.4rem',
                              padding: '0.65rem',
                              borderRadius: '10px',
                              border: '1px solid #e2e8f0',
                              background: 'white',
                              color: a.fileUrl ? '#0d1b3d' : '#cbd5e1',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              textDecoration: 'none',
                              cursor: a.fileUrl ? 'pointer' : 'not-allowed',
                              pointerEvents: a.fileUrl ? 'auto' : 'none',
                            }}
                          >
                            <ExternalLink size={14} /> Ko'rish
                          </a>
                          <button
                            type="button"
                            onClick={() => { setGradingId(a.id); setGrade(100); }}
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.65rem', borderRadius: '10px', border: 'none', background: '#0d1b3d', color: 'white', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                          >
                            <Award size={14} /> Baholash
                          </button>
                        </div>
                      )
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.65rem', borderRadius: '10px', border: '1px dashed #bbf7d0', background: '#f0fdf4', color: '#15803d', fontWeight: 700, fontSize: '0.8rem' }}>
                        <CheckCircle2 size={15} /> Tekshirilgan
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
