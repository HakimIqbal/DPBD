import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities';

export interface AuditLogEntry {
  actorId?: string | null;
  actorRole?: string | null;
  actorEmail?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
  ) {}

  /**
   * Persist an audit entry. Fire-and-forget: a failure here NEVER throws to
   * the caller, because audit failure must not break the main business
   * operation that triggered it. Errors are logged at error level so they
   * still surface in monitoring without blocking the request path.
   *
   * Callers should `await` this to preserve write ordering, but can equally
   * leave it un-awaited at the end of a handler if they don't care about
   * timing.
   */
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      const row = this.auditRepository.create({
        actorId: entry.actorId ?? null,
        actorRole: entry.actorRole ?? null,
        actorEmail: entry.actorEmail ?? null,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId ?? null,
        metadata: entry.metadata ?? null,
        ipAddress: entry.ipAddress ?? null,
        userAgent: entry.userAgent ?? null,
      });
      await this.auditRepository.save(row);
    } catch (error) {
      // Intentionally swallow — see method docstring. Log at error so the
      // failure is visible in operational dashboards.
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to write audit log (action=${entry.action}, entity=${entry.entityType}): ${message}`,
      );
    }
  }
}
