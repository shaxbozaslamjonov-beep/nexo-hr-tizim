'use client';

import React from 'react';
import { LucideIcon, PlusCircle, Target, TrendingUp, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { onboardingSteps } from '@/lib/mock/career-data';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionLabel: string;
  onAction: () => void;
}

export function EmptyState({ title, description, icon: Icon, actionLabel, onAction }: EmptyStateProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-8 p-6 bg-primary/5 rounded-full border border-primary/10">
        <Icon className="h-16 w-16 text-primary" strokeWidth={1} />
      </div>
      
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">{title}</h2>
      <p className="text-muted-foreground max-w-lg mx-auto mb-12 text-lg leading-relaxed">{description}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mb-12">
        {onboardingSteps.map((step, i) => (
          <Card key={step.id} className="rounded-xl border shadow-sm p-6 text-left hover:shadow-md transition-all duration-300 border-l-4 border-l-primary/40 bg-card group">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                {i === 0 && <PlusCircle className="h-6 w-6" />}
                {i === 1 && <Target className="h-6 w-6" />}
                {i === 2 && <TrendingUp className="h-6 w-6" />}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{t(step.titleKey)}</h3>
                <p className="text-xs text-muted-foreground">{t(step.descriptionKey)}</p>
              </div>
            </div>
            
            <div className="space-y-3 mt-auto">
              <div className="flex justify-between items-end">
                <p className="text-sm font-bold text-slate-900">
                  <span className="text-primary mr-1">[{step.statValue}]</span>
                  {t(step.statLabelKey)}
                </p>
                <p className="text-xs font-bold text-primary">{step.progress}%</p>
              </div>
              <Progress value={step.progress} className="h-1.5 bg-muted rounded-full" />
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-col items-center gap-4">
        <Button size="lg" onClick={onAction} className="px-12 py-7 rounded-xl shadow-xl shadow-primary/20 transition-all hover:translate-y-[-2px] hover:shadow-2xl hover:shadow-primary/30 text-lg font-bold">
          <Plus className="mr-2 h-6 w-6" />
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}
