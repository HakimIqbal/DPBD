import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Extend the `disbursements` table to support the CFO approval workflow:
 *
 *   - Adds 'approved' and 'rejected' to the status enum so the queue
 *     can model a real review lifecycle (pending → approved/rejected
 *     → process → completed). Existing rows remain valid because the
 *     three pre-existing values stay in the enum.
 *
 *   - Adds nullable columns for the audit trail of the review action:
 *       requestedBy / requestedAt — Finance who submitted the request
 *       reviewedBy / reviewedAt   — CFO/admin who decided
 *       rejectionReason            — text reason captured on reject
 *
 * FK columns ON DELETE SET NULL so deleting a user later doesn't
 * cascade-blow the disbursement history.
 *
 * The down() drops the new columns. Postgres can't drop a value from an
 * enum without rewriting affected rows, and dropping is not strictly
 * needed for forward-compatibility, so the enum values are left in place
 * on rollback (documented behavior).
 */
export class ExtendDisbursements1777450000000 implements MigrationInterface {
  name = 'ExtendDisbursements1777450000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add enum values one at a time, idempotent. Postgres ALTER TYPE
    // ADD VALUE has supported IF NOT EXISTS since 9.6.
    await queryRunner.query(
      `ALTER TYPE "disbursements_status_enum" ADD VALUE IF NOT EXISTS 'approved'`,
    );
    await queryRunner.query(
      `ALTER TYPE "disbursements_status_enum" ADD VALUE IF NOT EXISTS 'rejected'`,
    );

    // Audit columns. All nullable — historical rows didn't capture
    // these fields, so they stay NULL.
    await queryRunner.query(`
      ALTER TABLE "disbursements"
        ADD COLUMN IF NOT EXISTS "requestedBy"     uuid NULL,
        ADD COLUMN IF NOT EXISTS "requestedAt"     TIMESTAMP NULL,
        ADD COLUMN IF NOT EXISTS "reviewedBy"      uuid NULL,
        ADD COLUMN IF NOT EXISTS "reviewedAt"      TIMESTAMP NULL,
        ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT NULL
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "disbursements"
          ADD CONSTRAINT "FK_disbursements_requestedBy"
          FOREIGN KEY ("requestedBy") REFERENCES "users"("id") ON DELETE SET NULL;
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "disbursements"
          ADD CONSTRAINT "FK_disbursements_reviewedBy"
          FOREIGN KEY ("reviewedBy") REFERENCES "users"("id") ON DELETE SET NULL;
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$
    `);

    // Index on status — the CFO queue lookup (`status = 'pending'`) hits
    // this hot. Cheap to maintain since status churn is low.
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_disbursements_status" ON "disbursements" ("status")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_disbursements_status"`,
    );
    await queryRunner.query(
      `ALTER TABLE "disbursements" DROP CONSTRAINT IF EXISTS "FK_disbursements_reviewedBy"`,
    );
    await queryRunner.query(
      `ALTER TABLE "disbursements" DROP CONSTRAINT IF EXISTS "FK_disbursements_requestedBy"`,
    );
    await queryRunner.query(`
      ALTER TABLE "disbursements"
        DROP COLUMN IF EXISTS "rejectionReason",
        DROP COLUMN IF EXISTS "reviewedAt",
        DROP COLUMN IF EXISTS "reviewedBy",
        DROP COLUMN IF EXISTS "requestedAt",
        DROP COLUMN IF EXISTS "requestedBy"
    `);
    // Enum values 'approved' and 'rejected' are intentionally left in
    // place. Removing an enum value requires data migration of every
    // affected row and isn't safe to do in a generic down().
  }
}
