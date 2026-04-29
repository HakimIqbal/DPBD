import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Create the investment portfolio tables: `investments` (one row per
 * instrument the foundation holds) and `investment_transactions`
 * (append-only journal of cash and valuation events).
 *
 * The transactions table cascades from its parent — deleting an
 * investment also drops its history. The createdBy / recordedBy FKs to
 * users use ON DELETE SET NULL because we keep the financial record even
 * if the user account is later removed.
 *
 * `IF NOT EXISTS` is used everywhere so the migration is idempotent on
 * dev environments where TypeORM's `synchronize: true` may have already
 * created the tables.
 */
export class CreateInvestmentTables1777430123404 implements MigrationInterface {
  name = 'CreateInvestmentTables1777430123404';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // --- Enums ---
    // Postgres requires CREATE TYPE before the table that uses it. Wrap in
    // a DO block so we can guard against re-runs (no IF NOT EXISTS for
    // CREATE TYPE in PG <17 syntax we want to stay compatible with).
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "investments_instrumenttype_enum" AS ENUM
          ('reksa_dana', 'sukuk', 'deposito_syariah', 'saham_syariah');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "investments_status_enum" AS ENUM
          ('active', 'matured', 'liquidated');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "investment_transactions_transactiontype_enum" AS ENUM
          ('purchase', 'return_received', 'partial_liquidation', 'full_liquidation', 'value_update');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$
    `);

    // --- Parent table ---
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "investments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "instrumentType" "investments_instrumenttype_enum" NOT NULL,
        "institution" varchar(255) NOT NULL,
        "principalAmount" decimal(18,2) NOT NULL,
        "currentValue" decimal(18,2) NOT NULL,
        "purchaseDate" date NOT NULL,
        "maturityDate" date,
        "expectedReturnRate" decimal(5,2),
        "actualReturnAmount" decimal(18,2) NOT NULL DEFAULT 0,
        "status" "investments_status_enum" NOT NULL DEFAULT 'active',
        "notes" text,
        "createdBy" uuid,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_investments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_investments_createdBy_users"
          FOREIGN KEY ("createdBy") REFERENCES "users"("id")
          ON DELETE SET NULL
      )
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_investments_instrument_type" ON "investments" ("instrumentType")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_investments_status"          ON "investments" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_investments_purchase_date"   ON "investments" ("purchaseDate")`,
    );

    // --- Child journal table ---
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "investment_transactions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "investmentId" uuid NOT NULL,
        "transactionType" "investment_transactions_transactiontype_enum" NOT NULL,
        "amount" decimal(18,2) NOT NULL,
        "transactionDate" date NOT NULL,
        "notes" text,
        "recordedBy" uuid,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_investment_transactions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_invtx_investmentId_investments"
          FOREIGN KEY ("investmentId") REFERENCES "investments"("id")
          ON DELETE CASCADE,
        CONSTRAINT "FK_invtx_recordedBy_users"
          FOREIGN KEY ("recordedBy") REFERENCES "users"("id")
          ON DELETE SET NULL
      )
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_investment_tx_investment_id" ON "investment_transactions" ("investmentId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop child first because it FKs into parent.
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_investment_tx_investment_id"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "investment_transactions"`);

    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_investments_purchase_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_investments_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_investments_instrument_type"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "investments"`);

    await queryRunner.query(
      `DROP TYPE IF EXISTS "investment_transactions_transactiontype_enum"`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "investments_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "investments_instrumenttype_enum"`);
  }
}
