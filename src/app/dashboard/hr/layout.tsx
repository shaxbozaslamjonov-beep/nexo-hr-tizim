'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { usePathname } from 'next/navigation';

export default function HRRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();

  // Helper to generate breadcrumbs based on pathname
  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    const crumbs = [];
    
    // Default breadcrumb for HR Dashboard
    crumbs.push({ label: t('dashboard'), href: '/dashboard/hr' });

    if (segments.includes('candidates')) {
      crumbs.push({ label: t('candidates.title'), href: '/dashboard/hr/candidates' });
    } else if (segments.includes('employees')) {
      crumbs.push({ label: t('employees'), href: '/dashboard/hr/employees' });
    } else if (segments.includes('lessons')) {
      crumbs.push({ label: t('lessons'), href: '/dashboard/hr/lessons' });
      if (segments.includes('review')) {
        crumbs.push({ label: t('reviewAssignments') });
      }
    } else if (segments.includes('settings')) {
      crumbs.push({ label: t('settings.title') });
    } else if (segments.includes('kpi')) {
      crumbs.push({ label: t('kpiPerformance') });
    } else if (segments.includes('trial-period')) {
      crumbs.push({ label: t('probation') });
    } else if (segments.includes('career-maps')) {
      crumbs.push({ label: t('careerPaths') });
    }

    return crumbs;
  };

  if (!user) return null; 

  const hideSearch = pathname.includes('/candidates') || 
                     pathname.includes('/training') || 
                     pathname.includes('/tests') ||
                     pathname.includes('/employees') ||
                     pathname.includes('/vacancies') ||
                     (pathname.includes('/lessons') && !pathname.includes('/lessons/assignments')) ||
                     pathname.includes('/trial-period') ||
                     pathname.includes('/kpi') ||
                     pathname.includes('/career-maps');

  return (
    <DashboardLayout
      role={user.role}
      userName={`${user.firstName} ${user.lastName}`}
      breadcrumbs={getBreadcrumbs()}
      hideSearch={hideSearch}
    >
      {children}
    </DashboardLayout>
  );
}
