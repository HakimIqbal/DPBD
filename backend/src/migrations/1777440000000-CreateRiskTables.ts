import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Create the risk & compliance tables: `risk_thresholds` (configurable
 * rules the Risk Manager defines) and `risk_alerts` (breach events
 * raised by the evaluation engine).
 *
 * Alerts cascade-delete from their parent threshold so a deleted rule
 * doesn't leave dangling breach rows. createdBy / resolvedBy FKs to
 * users use ON DELETE SET NULL — the rule and its history remain
 * visible even if the user account is later removed.
 *
 * `IF NOT EXISTS` is used everywhere so the migration is idempotent on
 * dev environments where TypeORM's `synchronize: true` may have already
 * created the tables.
 */
export class CreateRiskTables1777440000000 implements MigrationInterface {
  name = 'CreateRiskTables1777440000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // --- Enums ---
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "risk_thresholds_operator_enum" AS ENUM
          ('greater_than', 'less_than', 'equals');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "risk_thresholds_severity_enum" AS ENUM
          ('info', 'warning', 'critical');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "risk_alerts_severity_enum" AS ENUM
          ('info', 'warning', 'critical');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$
    `);

    // --- Parent table: thresholds ---
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "risk_thresholds" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "metricKey" varchar(64) NOT NULL,
        "operator" "risk_thresholds_operator_enum" NOT NULL,
        "thresholdValue" decimal(18,4) NOT NULL,
        "severity" "risk_thresholds_severity_enum" NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "description" text,
        "createdBy" uuid,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_risk_thresholds" PRIMARY KEY ("id"),
        CONSTRAINT "FK_risk_thresholds_createdBy_users"
          FOREIGN KEY ("createdBy") REFERENCES "users"("id")
          ON DELETE SET NULL
      )
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_risk_thresholds_metric_key" ON "risk_thresholds" ("metricKey")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_risk_thresholds_severity"   ON "risk_thresholds" ("severity")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_risk_thresholds_is_active"  ON "risk_thresholds" ("isActive")`,
    );

    // --- Child table: alerts ---
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "risk_alerts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "thresholdId" uuid NOT NULL,
        "triggeredValue" decimal(18,4) NOT NULL,
        "message" varchar(512) NOT NULL,
        "severity" "risk_alerts_severity_enum" NOT NULL,
        "isResolved" boolean NOT NULL DEFAULT false,
        "resolvedAt" timestamptz,
        "resolvedBy" uuid,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_risk_alerts" PRIMARY KEY ("id"),
        CONSTRAINT "FK_risk_alerts_thresholdId_risk_thresholds"
          FOREIGN KEY ("thresholdId") REFERENCES "risk_thresholds"("id")
          ON DELETE CASCADE,
        CONSTRAINT "FK_risk_alerts_resolvedBy_users"
          FOREIGN KEY ("resolvedBy") REFERENCES "users"("id")
          ON DELETE SET NULL
      )
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_risk_alerts_threshold_id" ON "risk_alerts" ("thresholdId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_risk_alerts_severity"     ON "risk_alerts" ("severity")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_risk_alerts_is_resolved"  ON "risk_alerts" ("isResolved")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop child first because it FKs into parent.
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_risk_alerts_is_resolved"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_risk_alerts_severity"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_risk_alerts_threshold_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "risk_alerts"`);

    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_risk_thresholds_is_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_risk_thresholds_severity"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_risk_thresholds_metric_key"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "risk_thresholds"`);

    await queryRunner.query(`DROP TYPE IF EXISTS "risk_alerts_severity_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "risk_thresholds_severity_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "risk_thresholds_operator_enum"`);
  }
}
