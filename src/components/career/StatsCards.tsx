import { StatsCard } from './StatsCard';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { careerStats } from '@/lib/mock/career-data';

export function StatsCards() {
  const { t } = useLanguage();

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {careerStats.map((stat) => (
        <StatsCard 
          key={stat.id}
          title={t(stat.titleKey) || stat.id}
          value={stat.value} 
          subtitle={stat.subtitleKey ? `${t(stat.subtitleKey)}: ${stat.subtitleValue}` : undefined}
          progress={stat.progress} 
          progressLabel={stat.progressLabelKey ? t(stat.progressLabelKey) : undefined}
          footer={stat.footerKey ? `${t(stat.footerKey)}${stat.footerValue ? `: ${stat.footerValue}` : ''}` : undefined} 
          trend={stat.trend}
        />
      ))}
    </div>
  );
}
