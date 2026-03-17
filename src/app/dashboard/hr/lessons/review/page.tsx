'use client';

import React, { useEffect, useState } from 'react';
import { lessonService } from '@/lib/services/lessonService';
import { Lesson, Assignment, User } from '@/types';
import { 
  CheckCircle2, 
  Clock, 
  Search,
  BookOpen,
  User as UserIcon,
  Award,
  Filter,
  CheckCircle,
  AlertCircle,
  FileText,
  TrendingUp,
  LayoutGrid,
  ClipboardList,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  GraduationCap,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import styles from '@/components/lessons/lessons.module.css';

export default function AssignmentReviewPage() {
  const { user: currentUser } = useAuth();
  const { t, language } = useLanguage();
  
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'SUBMITTED' | 'CHECKED'>('SUBMITTED');
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [grade, setGrade] = useState<number>(100);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assignData, lessonData] = await Promise.all([
          lessonService.getAssignments(),
          lessonService.getLessons()
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

  const [searchQuery, setSearchQuery] = useState('');

  const displayed = assignments.filter(a => {
    const matchesFilter = filter === 'ALL' || a.status === filter;
    const matchesSearch = searchQuery === '' || 
      ((a as any).employee?.firstName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      ((a as any).employee?.lastName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.userId || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = [
    { 
      label: 'Jami yuborilgan', 
      value: assignments.length, 
      trend: `So'nggi 7 kun: +${assignments.filter(a => a.submittedAt && new Date(a.submittedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}`,
      icon: FileText, 
      color: 'bg-blue-500/10 text-blue-600' 
    },
    { 
      label: 'Kutilmoqda', 
      value: assignments.filter(a => a.status === 'SUBMITTED').length, 
      trend: 'Bugun: 0 ta yangi',
      icon: Clock, 
      color: 'bg-orange-500/10 text-orange-600' 
    },
    { 
      label: 'Tekshirilgan', 
      value: assignments.filter(a => a.status === 'CHECKED').length, 
      trend: 'Muvaffaqiyatli: 100%',
      icon: CheckCircle, 
      color: 'bg-green-500/10 text-green-600' 
    }
  ];

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <ClipboardList className="h-8 w-8 text-primary" />
              </div>
              {t('assignmentReview') || 'Topshiriqlarni tekshirish'}
            </h1>
            <p className="text-muted-foreground mt-1">Xodimlarning bajarilgan topshiriqlarini tekshiring va baholang</p>
          </div>
        </div>

        {/* 1. Statistika Kartochkalari (KPI Style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <Card key={i} className="border border-border shadow-sm bg-card rounded-xl overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                    <h3 className="text-4xl font-bold mt-2 text-foreground">{stat.value}</h3>
                    <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1 font-medium">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      {stat.trend}
                    </p>
                  </div>
                  <div className={`p-3 rounded-2xl ${stat.color} transition-transform group-hover:scale-110 duration-300`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 2. Filtrlar + Qidiruv Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-muted/20 p-4 rounded-2xl border border-border">
          <div className="flex items-center p-1 bg-background/50 rounded-xl w-fit border border-border">
            {[
              { id: 'ALL', label: 'Barchasi' },
              { id: 'SUBMITTED', label: 'Yangi' },
              { id: 'CHECKED', label: 'Tekshirilgan' }
            ].map((s) => (
              <Button
                key={s.id}
                variant="ghost"
                onClick={() => setFilter(s.id as any)}
                className={`rounded-lg px-6 py-2 h-9 text-sm font-semibold transition-all ${
                  filter === s.id 
                    ? "bg-primary/10 text-primary shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                {s.label}
              </Button>
            ))}
          </div>

          <div className="relative max-w-sm w-full lg:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Xodim bo'yicha qidirish..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl bg-background border-border hover:border-primary/50 focus:border-primary transition-all shadow-sm"
            />
          </div>
        </div>

        {/* 3. Xodim Filtri (Department Head Card) */}
        <div className="rounded-xl border border-border p-4 bg-muted/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-bold text-foreground">DE Department Head</h4>
              <p className="text-xs text-muted-foreground font-medium">Monitoring va boshqaruv bo'limi</p>
            </div>
          </div>
          <div className="flex gap-6">
             <div className="text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Topshiriqlar</p>
                <p className="text-lg font-bold text-foreground">{assignments.length}</p>
             </div>
             <div className="text-center border-x border-border/50 px-6">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Kutilmoqda</p>
                <p className="text-lg font-bold text-orange-500">{assignments.filter(a => a.status === 'SUBMITTED').length}</p>
             </div>
             <div className="text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Tayyor</p>
                <p className="text-lg font-bold text-green-500">{assignments.filter(a => a.status === 'CHECKED').length}</p>
             </div>
          </div>
        </div>

        {/* 4. Topshiriqlar Kartochkalari Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="animate-pulse bg-muted/30 border-none h-64 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayed.length === 0 ? (
              <div className="col-span-full bg-card/50 border border-dashed border-border p-20 rounded-[2rem] text-center">
                <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
                <h2 className="text-xl font-semibold text-foreground">Hozircha topshiriqlar yo'q</h2>
                <p className="text-muted-foreground mt-2 max-w-xs mx-auto">Sizda hali tekshirilishi kerak bo'lgan topshiriqlar mavjud emas.</p>
              </div>
            ) : displayed.map((a) => {
              const lesson = lessons.find(l => l.id === a.lessonId);
              return (
                <Card key={a.id} className="group border border-border shadow-sm hover:shadow-md transition-all duration-300 bg-card overflow-hidden rounded-2xl flex flex-col h-full ring-primary/5 hover:ring-2">
                  <div className="p-6 flex-1 space-y-5">
                    {/* Header */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-primary/5 rounded-lg">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">O'quv kursi topshiriq'i</span>
                      </div>
                      <h3 className="text-xl font-bold tracking-tight text-foreground line-clamp-2 min-h-[3.5rem] group-hover:text-primary transition-colors">
                        {lesson?.title[language] || lesson?.title['ru'] || 'Sarlahasiz dars'}
                      </h3>
                    </div>

                    {/* Metrics Board */}
                    <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden divide-y divide-border/50">
                      <div className="flex items-center justify-between p-3">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase">Xodim:</span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                            {((a as any).employee?.firstName || a.userId || '??')[0]}
                          </div>
                          <span className="text-sm font-semibold text-foreground truncate max-w-[120px]">
                            {(a as any).employee ? `${(a as any).employee.firstName} ${(a as any).employee.lastName}` : (a.userId || 'ID: ---')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 text-sm">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase font-sans">Sana:</span>
                        <span className="font-medium text-foreground">{a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : '---'}</span>
                      </div>
                      <div className="flex items-center justify-between p-3">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase">Baho:</span>
                        {a.status === 'CHECKED' ? (
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-bold text-foreground">{a.grade}/100</span>
                            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-green-500" style={{ width: `${a.grade}%` }} />
                            </div>
                          </div>
                        ) : (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none rounded-lg text-[10px] font-bold px-2 py-0.5">
                            Kutilmoqda
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between p-3 border-none">
                         <span className="text-[11px] font-bold text-muted-foreground uppercase">Holat:</span>
                         <Badge variant="outline" className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider
                            ${a.status === 'CHECKED' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 
                              a.status === 'SUBMITTED' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' : 
                              'bg-orange-500/10 text-orange-600 border-orange-500/20'}`}>
                            {a.status === 'CHECKED' ? '✓ Tekshirilgan' : a.status === 'SUBMITTED' ? '● Yangi' : '○ Kutilmoqda'}
                          </Badge>
                      </div>
                    </div>

                    {/* Question Excerpt */}
                    <div className="space-y-2">
                       <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 opacity-60">
                         <MessageSquare className="h-3 w-3" /> Xodim Javobi:
                       </span>
                       <div className="p-3 bg-muted/5 rounded-lg border-l-2 border-primary/20 italic text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                         "{a.submissionText || 'Javob matni mavjud emas'}"
                       </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-6 pt-0 border-t border-border/30 bg-muted/5 mt-auto">
                    {a.status === 'SUBMITTED' ? (
                      gradingId === a.id ? (
                        <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ball belgilang (0-100)</label>
                            <Input 
                              type="number" 
                              className="h-10 text-lg font-bold text-center border-primary/20 focus:border-primary rounded-xl" 
                              value={grade} 
                              onChange={(e) => setGrade(Number(e.target.value))}
                              min="0" max="100"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button className="h-10 flex-1 rounded-xl font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" onClick={() => handleGrade(a.id)}>
                              Saqlash
                            </Button>
                            <Button variant="outline" className="h-10 px-4 rounded-xl text-xs font-semibold" onClick={() => setGradingId(null)}>
                              Bekor
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-4 flex gap-3">
                          <Button variant="outline" className="flex-1 h-10 rounded-xl font-bold text-xs gap-2 group/btn">
                             <ExternalLink className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" /> Ko'rish
                          </Button>
                          <Button className="flex-1 h-10 rounded-xl font-bold text-xs gap-2 shadow-sm" onClick={() => setGradingId(a.id)}>
                            <Award className="h-4 w-4" /> Baholash
                          </Button>
                        </div>
                      )
                    ) : (
                      <div className="pt-4">
                        <Button variant="outline" className="w-full h-11 rounded-xl font-bold text-xs gap-2 hover:bg-primary/5 hover:text-primary transition-all border-dashed">
                           <CheckCircle2 size={16} className="text-green-500" /> Tekshirilgan · Tafsilotlar
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
