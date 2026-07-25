import prisma from '@/lib/prisma';

export interface LogAuditOptions {
  companyId: string;
  userId?: string;
  userEmail?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: string | Record<string, any>;
  ipAddress?: string;
}

export async function logAudit(options: LogAuditOptions) {
  try {
    const detailsStr = typeof options.details === 'object'
      ? JSON.stringify(options.details)
      : options.details;

    await prisma.auditLog.create({
      data: {
        companyId: options.companyId,
        userId: options.userId,
        userEmail: options.userEmail,
        action: options.action,
        entityType: options.entityType,
        entityId: options.entityId,
        details: detailsStr,
        ipAddress: options.ipAddress,
      },
    });
  } catch (error) {
    console.error('[Audit Log Error]', error);
  }
}
