'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface CollapsibleProps {
  title: React.ReactNode;
  icon?: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
}

export function Collapsible({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
  className = '',
  triggerClassName = '',
  contentClassName = '',
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`w-full ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full p-2 transition-colors duration-200 rounded-lg group ${triggerClassName}`}
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 shrink-0" />}
          <span className="text-sm font-semibold tracking-wider uppercase opacity-70 group-hover:opacity-100 transition-opacity">
            {title}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
        </motion.div>
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className={`mt-1 space-y-1 ${contentClassName}`}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
