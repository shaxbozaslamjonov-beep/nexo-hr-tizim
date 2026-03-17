'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface PillTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: any) => void;
}

export function PillTabs({ tabs, activeTab, onTabChange }: PillTabsProps) {
  return (
    <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/80 backdrop-blur-sm rounded-2xl w-fit overflow-x-auto no-scrollbar border border-slate-200/50">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300 whitespace-nowrap relative group
              ${isActive 
                ? 'text-white shadow-lg shadow-slate-900/10' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
              }
            `}
          >
            <Icon size={18} className={`${isActive ? 'scale-110' : 'opacity-70 group-hover:opacity-100'} transition-all relative z-20`} />
            <span className="relative z-20 tracking-tight">{tab.label}</span>
            {isActive && (
              <motion.div 
                layoutId="activePillTabIndicator"
                className="absolute inset-0 bg-slate-900 rounded-xl z-10"
                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
