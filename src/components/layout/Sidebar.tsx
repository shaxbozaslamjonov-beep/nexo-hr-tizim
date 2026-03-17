'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Home, 
  BarChart2, 
  ClipboardList, 
  Inbox, 
  Users, 
  Mic2, 
  FolderHeart, 
  GraduationCap, 
  FileEdit, 
  Building2, 
  Rocket, 
  Timer, 
  Trophy, 
  Map, 
  Settings, 
  BookOpen,
  CheckSquare,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Calendar,
  Database
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import styles from './sidebar.module.css';
import { useAuth } from '@/contexts/AuthContext';
import { Collapsible } from '@/components/ui/Collapsible';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  translationKey: string;
}

interface NavSection {
  titleKey: string;
  icon: React.ElementType;
  items: NavItem[];
}

export function Sidebar({ role, userName, collapsed, onCollapse }: {
  role: string,
  userName: string,
  collapsed: boolean,
  onCollapse: (val: boolean) => void
}) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { logout } = useAuth();

  const navSections: NavSection[] = [
    {
      titleKey: 'sidebar.main',
      icon: Home,
      items: [
        { label: 'Dashboard', href: '/dashboard/hr', icon: Home, translationKey: 'dashboard' },
        { label: 'Analytics', href: '/dashboard/hr/analytics', icon: BarChart2, translationKey: 'analytics.title' },
      ],
    },
    {
      titleKey: 'sidebar.recruitment',
      icon: Briefcase,
      items: [
        { label: 'Vacancies', href: '/dashboard/hr/vacancies', icon: ClipboardList, translationKey: 'vacancies.title' },
        { label: 'Applications', href: '/dashboard/hr/applications', icon: Inbox, translationKey: 'applications.title' },
        { label: 'Candidates', href: '/dashboard/hr/candidates', icon: Users, translationKey: 'candidates.title' },
        { label: 'Interviews', href: '/dashboard/hr/interviews', icon: Mic2, translationKey: 'interviews.title' },
        { label: 'Reserve Pool', href: '/dashboard/hr/reserve', icon: FolderHeart, translationKey: 'reserve.title' },
      ],
    },
    {
      titleKey: 'sidebar.development',
      icon: GraduationCap,
      items: [
        { label: 'Training Tracks', href: '/dashboard/hr/training', icon: GraduationCap, translationKey: 'training.title' },
        { label: 'Tests', href: '/dashboard/hr/tests', icon: FileEdit, translationKey: 'tests.title' },
      ],
    },
    {
      titleKey: 'sidebar.workforce',
      icon: Users,
      items: [
        { label: 'Workforce', href: '/dashboard/hr/employees', icon: Building2, translationKey: 'workforce' },
        { label: 'Onboarding', href: '/dashboard/hr/onboarding', icon: Rocket, translationKey: 'onboarding' },
        { label: 'Probation', href: '/dashboard/hr/trial-period', icon: Timer, translationKey: 'probation' },
        { label: 'KPI & Performance', href: '/dashboard/hr/kpi', icon: Trophy, translationKey: 'kpiPerformance' },
        { label: 'Career Paths', href: '/dashboard/hr/career-maps', icon: Map, translationKey: 'careerPaths' },
      ],
    },
    {
      titleKey: 'sidebar.lessons',
      icon: BookOpen,
      items: [
        { label: 'All Lessons', href: '/dashboard/hr/lessons', icon: BookOpen, translationKey: 'sidebar.lessonsList' },
        ...(role?.toUpperCase() === 'EMPLOYEE' ? [
          { label: 'My Assignments', href: '/dashboard/hr/lessons/assignments', icon: ClipboardList, translationKey: 'sidebar.myAssignments' }
        ] : []),
        ...(role?.toUpperCase() === 'ADMIN' || role?.toUpperCase() === 'HR_MANAGER' ? [
          { label: 'Review Assignments', href: '/dashboard/hr/lessons/review', icon: CheckSquare, translationKey: 'sidebar.reviewAssignments' }
        ] : []),
      ],
    },
  ];

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <span className={styles.logoInner}>N</span>
        </div>
        {!collapsed && (
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>Nexo HR</span>
            <span className={styles.logoSub}>Platform</span>
          </div>
        )}
      </div>

      <button 
        className={styles.toggleBtn}
        onClick={() => onCollapse(!collapsed)}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <nav className={styles.nav}>
        {navSections.map((section) => (
          <div key={section.titleKey} className={styles.section}>
            {collapsed ? (
              <div className={styles.collapsedSection}>
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                      title={t(item.translationKey)}
                    >
                      <div className={styles.navIcon}>
                        <Icon size={20} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <Collapsible
                title={t(section.titleKey)}
                icon={section.icon}
                defaultOpen={section.items.some(item => pathname === item.href) || section.titleKey === 'sidebar.main'}
                triggerClassName={styles.collapsibleTrigger}
              >
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`${styles.navItem} ${styles.nestedNavItem} ${isActive ? styles.active : ''}`}
                    >
                      <div className={styles.navIcon}>
                        <Icon size={18} />
                      </div>
                      <span>{t(item.translationKey)}</span>
                    </Link>
                  );
                })}
              </Collapsible>
            )}
          </div>
        ))}
      </nav>

      <div className={styles.footer}>
        {!collapsed && (
          <div className={styles.userProfile}>
            <div className={styles.avatar}>
              {userName.split(' ').map(n => n[0]).join('')}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{userName}</span>
              <span className={styles.userRole}>{role}</span>
            </div>
          </div>
        )}
        <div className={styles.bottomActions}>
          <Collapsible
            title={t('sidebar.settings')}
            icon={Settings}
            defaultOpen={pathname === '/dashboard/hr/settings'}
            triggerClassName={styles.collapsibleTrigger}
            className={collapsed ? 'hidden' : ''}
          >
            <Link 
              href="/dashboard/hr/settings" 
              className={`${styles.navItem} ${styles.nestedNavItem} ${pathname === '/dashboard/hr/settings' ? styles.active : ''}`}
            >
              <div className={styles.navIcon}>
                <Settings size={18} />
              </div>
              <span>{t('settings.title')}</span>
            </Link>
          </Collapsible>
          
          {collapsed && (
            <Link 
              href="/dashboard/hr/settings" 
              className={`${styles.navItem} ${pathname === '/dashboard/hr/settings' ? styles.active : ''}`}
              title={t('settings.title')}
            >
              <div className={styles.navIcon}>
                <Settings size={20} />
              </div>
            </Link>
          )}

          <button 
            onClick={logout}
            className={`${styles.navItem} ${styles.logoutBtn}`}
          >
            <div className={styles.navIcon}>
              <LogOut size={20} />
            </div>
            {!collapsed && <span>{t('logout')}</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
