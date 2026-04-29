import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * Append-only audit record. Once written, rows are never updated or deleted
 * by application code — that's the whole point. The `update: false` flag on
 * `createdAt` together with the absence of an UpdateDateColumn enforces the
 * immutability at the entity layer.
 *
 * Actor fields snapshot the user at the time of the action (role, email)
 * because the user record can be deleted, suspended, or have its role
 * changed afterwards. Joining `users` to reconstruct context retroactively
 * is unsafe — keep the snapshot.
 */
@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * UUID of the user who performed the action. Nullable so we can still
   * record system actions (cron jobs, webhook handlers) that have no user.
   */
  @Index('IDX_audit_logs_actor_id')
  @Column({ type: 'uuid', nullable: true })
  actorId: string | null;

  /**
   * Snapshot of the actor's role at the time of the action. Stored as a
   * plain string rather than the `users_role_enum` so historical rows
   * survive future enum migrations unchanged.
   */
  @Column({ type: 'varchar', length: 64, nullable: true })
  actorRole: string | null;

  /** Snapshot of the actor's email at the time of the action. */
  @Column({ type: 'varchar', length: 255, nullable: true })
  actorEmail: string | null;

  /**
   * Action verb / event name in SCREAMING_SNAKE_CASE.
   * Examples: USER_CREATED, DONATION_APPROVED, TRANSACTION_FLAGGED.
   */
  @Index('IDX_audit_logs_action')
  @Column({ type: 'varchar', length: 64 })
  action: string;

  /**
   * The resource type the action was performed against.
   * Examples: User, Donation, Program, Investment.
   */
  @Index('IDX_audit_logs_entity_type')
  @Column({ type: 'varchar', length: 64 })
  entityType: string;

  /** ID of the affected record (UUID for our tables, string for foreign refs). */
  @Column({ type: 'varchar', length: 64, nullable: true })
  entityId: string | null;

  /**
   * Free-form context: { before, after, reason, ... }. JSONB for indexable
   * key access at the database layer if we ever need it.
   */
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  /** Source IPv4/IPv6 address (max 45 chars covers IPv6 with scope id). */
  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  /** User-Agent string. Truncated to 1024 to stay sane on misbehaved clients. */
  @Column({ type: 'varchar', length: 1024, nullable: true })
  userAgent: string | null;

  /**
   * Timestamp the row was inserted. `update: false` ensures TypeORM never
   * emits an UPDATE for this column, even if we accidentally save() the
   * entity again.
   */
  @Index('IDX_audit_logs_created_at')
  @CreateDateColumn({ type: 'timestamptz', update: false })
  createdAt: Date;
}
