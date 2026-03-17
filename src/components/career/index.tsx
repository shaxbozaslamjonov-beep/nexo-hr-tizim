import React from 'react';
import Placeholder from './Placeholder';
export { default as CareerMapTree } from './CareerMapTree';
export { default as SkillGapAnalysis } from './SkillGapAnalysis';
export { default as DevelopmentPlanBoard } from './DevelopmentPlanBoard';
export { default as TalentPoolGrid } from './TalentPoolGrid';
export { default as SuccessionMatrix } from './SuccessionMatrix';

// Shared components
export { Card, CardHeader, CardTitle, CardContent } from './Card';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';
export { StatsCards } from './StatsCards';
export { CareerHealthCard } from './CareerHealthCard';
export { CareerHealthFormModal } from './CareerHealthFormModal';
export { TabsNavigation } from './TabsNavigation';
export { EmptyState } from './EmptyState';
export { PositionFormModal } from './PositionFormModal';

// Placeholders
export const PositionTreeView = () => <Placeholder name="Position Tree View" />;
export const EmployeeCareerProfile = () => <Placeholder name="Employee Career Profile" />;
export const CareerAnalytics = () => <Placeholder name="Career Analytics" />;
