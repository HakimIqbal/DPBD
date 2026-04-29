import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Create the audit_logs table and its filtering indexes.
 *
 * The CREATE statements use `IF NOT EXISTS` so the migration is idempotent
 * — re-runs on a database where TypeORM's `synchronize: true` already
 * materialised the table (e.g. dev environments) succeed as no-ops, and
 * the migration row is still recorded so production deployments behave
 * deterministically.
 *
 * Indexes match the four columns we expect to filter by: actorId, action,
 * entityType, and createdAt. Composite indexes are intentionally omitted —
 * add them later only if EXPLAIN shows a real workload that needs them.
 */
export class CreateAuditLogsTable1777428808817 implements MigrationInterface {
  name = 'CreateAuditLogsTable1777428808817';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "audit_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "actorId" uuid,
        "actorRole" varchar(64),
        "actorEmail" varchar(255),
        "action" varchar(64) NOT NULL,
        "entityType" varchar(64) NOT NULL,
        "entityId" varchar(64),
        "metadata" jsonb,
        "ipAddress" varchar(45),
        "userAgent" varchar(1024),
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_audit_logs_actor_id"    ON "audit_logs" ("actorId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_audit_logs_action"      ON "audit_logs" ("action")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_audit_logs_entity_type" ON "audit_logs" ("entityType")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_audit_logs_created_at"  ON "audit_logs" ("createdAt")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes first so the DROP TABLE doesn't have to cascade.
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_audit_logs_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_audit_logs_entity_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_audit_logs_action"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_audit_logs_actor_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs"`);
  }
}
