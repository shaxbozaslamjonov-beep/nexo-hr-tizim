import prisma from './prisma';

// Temporary bridge until company selection / signup UI exists: every
// self-registration flow that doesn't yet know its company (generic
// register, legacy callers) falls back to the single seeded company.
// Remove once multi-company onboarding ships and callers pass companyId explicitly.
export async function getDefaultCompanyId(): Promise<string> {
  const company = await prisma.company.findFirst({ orderBy: { createdAt: 'asc' } });
  if (!company) {
    throw new Error('No company exists. Seed a Company row before registering users.');
  }
  return company.id;
}
