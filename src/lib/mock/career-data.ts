export const careerStats = [
  {
    id: 'total-paths',
    titleKey: 'careerMaps.stats.totalPaths',
    value: 24,
    subtitleKey: 'careerMaps.stats.activePaths',
    subtitleValue: 12,
    progress: 50,
    progressLabelKey: 'careerMaps.stats.progressToTarget',
    footerKey: 'careerMaps.stats.latest',
    footerValue: '17.03.2026'
  },
  {
    id: 'talent-density',
    titleKey: 'careerMaps.stats.talentDensity',
    value: '86%',
    subtitleKey: 'careerMaps.stats.highPotential',
    subtitleValue: 12,
    progress: 80,
    progressLabelKey: 'careerMaps.stats.progressToTarget',
    footerKey: 'careerMaps.stats.vsLastMonth',
    trend: { value: '+5%', direction: 'up' as const }
  },
  {
    id: 'growth-velocity',
    titleKey: 'careerMaps.stats.growthVelocity',
    value: '+12%',
    subtitleKey: 'careerMaps.stats.monthlyGrowth',
    subtitleValue: '2.4%',
    progress: 30,
    progressLabelKey: 'careerMaps.stats.progressToTarget',
    footerKey: 'careerMaps.stats.target',
    footerValue: '15% by Q3'
  }
];

export const careerHealth = {
  rating: 'B+',
  metrics: [
    { key: 'careerMaps.careerHealth.readiness', value: '74%' },
    { key: 'careerMaps.careerHealth.coverage', value: '65%' },
    { key: 'careerMaps.careerHealth.talentPool', value: '18' },
    { key: 'careerMaps.careerHealth.filledRoles', value: '4/6' }
  ],
  readinessLevels: [
    { key: 'careerMaps.careerHealth.readyNow', value: '12' },
    { key: 'careerMaps.careerHealth.readyIn6Months', value: '8' },
    { key: 'careerMaps.careerHealth.readyIn1Year', value: '5' }
  ],
  lastUpdated: '17.03.2026'
};

export const onboardingSteps = [
  {
    id: 'step1',
    titleKey: 'careerMaps.emptyState.step1.title',
    descriptionKey: 'careerMaps.emptyState.step1.description',
    statValue: 12,
    statLabelKey: 'careerMaps.emptyState.positionsCreated',
    progress: 30
  },
  {
    id: 'step2',
    titleKey: 'careerMaps.emptyState.step2.title',
    descriptionKey: 'careerMaps.emptyState.step2.description',
    statValue: 24,
    statLabelKey: 'careerMaps.emptyState.skillsDefined',
    progress: 65
  },
  {
    id: 'step3',
    titleKey: 'careerMaps.emptyState.step3.title',
    descriptionKey: 'careerMaps.emptyState.step3.description',
    statValue: 8,
    statLabelKey: 'careerMaps.emptyState.pathsPlanned',
    progress: 20
  }
];

export const careerPositions = [
  {
    id: '1',
    title: 'Senior Operator',
    grade: '5',
    department: 'Production',
    requiredSkills: 'Lean, Safety, Teamwork',
    nextPositions: 'Shift Supervisor, Production Manager',
    readiness: 75,
    status: 'active'
  },
  {
    id: '2',
    title: 'Quality Analyst',
    grade: '4',
    department: 'Quality Control',
    requiredSkills: 'ISO 9001, Data Analysis',
    nextPositions: 'Quality Manager, Process Engineer',
    readiness: 45,
    status: 'active'
  },
  {
    id: '3',
    title: 'Logistics Coordinator',
    grade: '4',
    department: 'Supply Chain',
    requiredSkills: 'SAP, Inventory Mgmt',
    nextPositions: 'Logistics Manager',
    readiness: 90,
    status: 'completed'
  },
  {
    id: '5',
    title: 'Plant Manager',
    grade: '8',
    department: 'Management',
    requiredSkills: 'Strategy, Operations, P&L',
    nextPositions: 'Operations Director',
    readiness: 15,
    status: 'highPotential'
  }
];
