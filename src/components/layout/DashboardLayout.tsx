'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { SupportChatWidget } from '@/components/ai/SupportChatWidget';
import styles from './dashboard-layout.module.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: string;
  userName: string;
  breadcrumbs?: { label: string; href?: string }[];
  hideSearch?: boolean;
}

export function DashboardLayout({ children, role, userName, breadcrumbs = [], hideSearch = false }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className={styles.root}>
      <Sidebar
        role={role}
        userName={userName}
        collapsed={collapsed}
        onCollapse={setCollapsed}
      />
      <div className={`${styles.main} ${collapsed ? styles.mainCollapsed : ''}`}>
        <Header
          breadcrumbs={breadcrumbs}
          collapsed={collapsed}
          userName={userName}
          hideSearch={hideSearch}
        />
        <main className={styles.content}>
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{ width: '100%', height: '100%' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      {['EMPLOYEE', 'CANDIDATE'].includes(role?.toUpperCase()) && <SupportChatWidget />}
    </div>
  );
}
