import type { AuthenticatedRequest } from '../types';

/**
 * Subset of the audit-log entry that describes the actor and the request
 * environment. Spread this into an `auditService.log()` call alongside the
 * action-specific fields:
 *
 *   await this.auditService.log({
 *     ...auditActorFromReq(req),
 *     action: 'USER_CREATED',
 *     entityType: 'User',
 *     entityId: created.id,
 *     metadata: { email: dto.email, role: dto.role },
 *   });
 */
export interface AuditActor {
  actorId: string | null;
  actorRole: string | null;
  actorEmail: string | null;
  ipAddress: string | null;
  userAgent: string | null;
}

/** Pulls actor + transport info out of the authenticated request. */
export function auditActorFromReq(req: AuthenticatedRequest): AuditActor {
  const ua = req.headers['user-agent'];
  return {
    actorId: req.user?.id ?? null,
    actorRole: req.user?.role ?? null,
    actorEmail: req.user?.email ?? null,
    ipAddress: req.ip ?? null,
    userAgent: typeof ua === 'string' ? ua : null,
  };
}
