'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { 
  Home, 
  GitBranch, 
  User, 
  PieChart, 
  Calendar, 
  Users, 
  GitMerge, 
  BarChart 
} from 'lucide-react';
import { EmptyState } from './EmptyState';

export function TabsNavigation({ handleAction, children }: { handleAction: () => void; children?: React.ReactNode }) {
  const { t } = useLanguage();
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const tabs: { id: string; key: string; uz: string; icon: any }[] = [
    { id: 'overview', key: 'overview', uz: 'Karyera sharhi', icon: Home },
    { id: 'tree', key: 'tree', uz: 'Lavozimlar daraxti', icon: GitBranch },
    { id: 'profile', key: 'employeeProfile', uz: 'Xodim profili', icon: User },
    { id: 'skill-gap', key: 'skillGap', uz: 'Ko‘nikmalar tahlili', icon: PieChart },
    { id: 'idp', key: 'developmentPlans', uz: 'Rivojlanish rejalari', icon: Calendar },
    { id: 'talent', key: 'talentPool', uz: 'Iste\'dodlar zaxirasi', icon: Users },
    { id: 'succession', key: 'successionMatrix', uz: 'Vorislik matritsasi', icon: GitMerge },
    { id: 'analytics', key: 'analytics', uz: 'Karyera analitikasi', icon: BarChart },
  ];

  const getTabStyle = (id: string) => {
    // We need to know if it's active. Since TabsTrigger is a subcomponent, 
    // we'll pass a function to it or just use the CSS matching if possible.
    // However, to be certain about the design, let's use the Tabs context logic here by wrapping
    // our own TabButton if needed, or just relying on the fact that TabsTrigger adds data-state.
    // Since we're using inline styles, we'll use a wrapper to track active state if possible,
    // but the easiest is to just use a custom TabButton inside TabsNavigation.
    return {}; // Placeholder, see logic inside .map
  };

  return (
    <Tabs defaultValue="overview" className="w-full mt-8">
      <style>{`
        .tab-button[data-state="active"] {
          background-color: rgba(99, 102, 241, 0.1) !important;
          border-color: #6366f1 !important;
          color: #6366f1 !important;
        }
        .tab-button[data-state="active"] svg {
          color: #6366f1 !important;
        }
        .tab-button:hover {
          background-color: rgba(99, 102, 241, 0.05) !important;
          border-color: rgba(99, 102, 241, 0.3) !important;
        }
      `}</style>
      <div 
        style={{ 
          overflowX: 'auto', 
          marginBottom: '2rem', 
          msOverflowStyle: 'none', 
          scrollbarWidth: 'none', 
          paddingBottom: '0.5rem' 
        }}
        className="no-scrollbar"
      >
        <TabsList style={{ 
          display: 'flex', 
          flexDirection: 'row', 
          gap: '0.5rem', 
          flexWrap: 'wrap', 
          minWidth: 'max-content',
          border: 'none',
          padding: '0'
        }}>
          {tabs.map((tab) => {
            return (
              <TabsNavigationButton 
                key={tab.id}
                tab={tab}
                t={t}
                isHovered={hoveredTab === tab.id}
                onMouseEnter={() => setHoveredTab(tab.id)}
                onMouseLeave={() => setHoveredTab(null)}
              />
            );
          })}
        </TabsList>
      </div>
      
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="mt-0 outline-none focus-visible:ring-0">
          {tab.id === 'overview' && children ? (
            <div className="min-h-[500px]">
              {children}
            </div>
          ) : (
            <div style={{
              background: 'var(--surface)',
              borderRadius: '20px',
              border: '1px solid var(--border)',
              padding: '3rem',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
              minHeight: '550px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <EmptyState
                title={t(`careerMaps.tabs.${tab.key}`) || tab.uz}
                description={t('careerMaps.emptyState.description')}
                icon={tab.icon}
                actionLabel={t('careerMaps.emptyState.getStarted')}
                onAction={handleAction}
              />
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}

// Special wrapper to access TabsContext for active state
function TabsNavigationButton({ tab, t, isHovered, onMouseEnter, onMouseLeave }: any) {
  // We'll use the TabsTrigger but we need to know if it's active to apply inline styles.
  // Unfortunately TabsTrigger hides the isActive state internally.
  // I will modify Tabs.tsx to export the context or just implement the button here.
  return (
    <TabsTrigger 
      value={tab.id}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.625rem 1.25rem',
        borderRadius: '0.5rem',
        border: '1px solid var(--border, #e2e8f0)',
        background: 'var(--surface, white)',
        fontSize: '0.875rem',
        fontWeight: 500,
        color: 'var(--text-secondary, #475569)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        boxShadow: isHovered ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : 'none',
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
      }}
      className="tab-button"
    >
      <tab.icon size={16} />
      <span>{t(`careerMaps.tabs.${tab.key}`) || tab.uz}</span>
    </TabsTrigger>
  );
}
