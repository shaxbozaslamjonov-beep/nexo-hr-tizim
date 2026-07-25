import prisma from '@/lib/prisma';

export type PlanType = 'trial' | 'starter' | 'professional' | 'enterprise';

export interface PlanLimits {
  name: string;
  maxEmployees: number;
  maxActiveVacancies: number;
  aiAssistant: boolean;
  customBranding: boolean;
  priceUsdMonth: number;
  priceUzsMonth: number;
}

export const PLAN_CONFIGS: Record<PlanType, PlanLimits> = {
  trial: {
    name: 'Free Trial (14 kun)',
    maxEmployees: 10,
    maxActiveVacancies: 2,
    aiAssistant: true,
    customBranding: false,
    priceUsdMonth: 0,
    priceUzsMonth: 0,
  },
  starter: {
    name: 'Starter',
    maxEmployees: 50,
    maxActiveVacancies: 5,
    aiAssistant: false,
    customBranding: false,
    priceUsdMonth: 29,
    priceUzsMonth: 370000,
  },
  professional: {
    name: 'Professional',
    maxEmployees: 250,
    maxActiveVacancies: 50,
    aiAssistant: true,
    customBranding: true,
    priceUsdMonth: 79,
    priceUzsMonth: 1000000,
  },
  enterprise: {
    name: 'Enterprise',
    maxEmployees: 999999,
    maxActiveVacancies: 999999,
    aiAssistant: true,
    customBranding: true,
    priceUsdMonth: 299,
    priceUzsMonth: 3800000,
  },
};

export async function getCompanyLimits(companyId: string) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true, name: true, slug: true, plan: true },
  });

  if (!company) {
    throw new Error('Kompaniya topilmadi');
  }

  const planKey = (company.plan?.toLowerCase() || 'trial') as PlanType;
  const limits = PLAN_CONFIGS[planKey] || PLAN_CONFIGS.trial;

  // Count current usage
  const [employeeCount, activeVacanciesCount] = await Promise.all([
    prisma.user.count({
      where: {
        companyId,
        role: { not: 'CANDIDATE' },
      },
    }),
    prisma.vacancy.count({
      where: {
        companyId,
        status: 'OPEN',
      },
    }),
  ]);

  return {
    company,
    plan: planKey,
    limits,
    usage: {
      employees: employeeCount,
      activeVacancies: activeVacanciesCount,
    },
    canAddEmployee: employeeCount < limits.maxEmployees,
    canCreateVacancy: activeVacanciesCount < limits.maxActiveVacancies,
  };
}

export async function checkCanCreateVacancy(companyId: string): Promise<{ allowed: boolean; reason?: string }> {
  const info = await getCompanyLimits(companyId);
  if (!info.canCreateVacancy) {
    return {
      allowed: false,
      reason: `Sizning tarifingizda (${info.limits.name}) maksimal ${info.limits.maxActiveVacancies} ta ochiq vakansiya yaratish mumkin. Limitga yetdingiz.`,
    };
  }
  return { allowed: true };
}

export async function checkCanAddEmployee(companyId: string): Promise<{ allowed: boolean; reason?: string }> {
  const info = await getCompanyLimits(companyId);
  if (!info.canAddEmployee) {
    return {
      allowed: false,
      reason: `Sizning tarifingizda (${info.limits.name}) maksimal ${info.limits.maxEmployees} ta xodimlarga ruxsat berilgan. Limitga yetdingiz.`,
    };
  }
  return { allowed: true };
}
