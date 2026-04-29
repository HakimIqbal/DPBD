import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds organizational role values to the existing `users_role_enum` Postgres enum.
 *
 * PostgreSQL enums require ALTER TYPE ... ADD VALUE statements to be issued
 * one at a time (you cannot add multiple values in a single statement). Each
 * value is wrapped with `IF NOT EXISTS` so this migration is idempotent —
 * re-running it on a database that already has the values is a no-op.
 *
 * `transaction = false` disables TypeORM's auto-wrapping of the migration
 * in a transaction. This is required because some Postgres connection
 * poolers (e.g. Supabase's session pooler) silently fail to persist
 * `ALTER TYPE ADD VALUE` when issued inside a transaction block — even
 * though the COMMIT appears to succeed. Running each statement in
 * autocommit mode avoids that quirk and is also recommended by the
 * Postgres docs, which note the new value cannot be used in the same
 * transaction it was added in.
 *
 * NOTE on rollback: PostgreSQL has no `ALTER TYPE ... DROP VALUE` clause.
 * Removing enum values requires rebuilding the type (rename old, create new,
 * alter every dependent column, drop old) which is risky if any row already
 * uses one of the new values. We therefore do not implement a destructive
 * down() — see the warning emitted below.
 */
export class AddOrganizationalRoles1777425677523 implements MigrationInterface {
  name = 'AddOrganizationalRoles1777425677523';

  // Run outside a transaction — see class comment above.
  transaction = false as const;

  public async up(queryRunner: QueryRunner): Promise<void> {
    const newRoles = [
      'ceo',
      'cfo',
      'investment_manager',
      'risk_manager',
      'ethic_committee',
      'audit_independent',
      'dewan_pengawas',
      'dewan_pembina',
      'partnership_onboarding',
    ];

    for (const role of newRoles) {
      await queryRunner.query(
        `ALTER TYPE public.users_role_enum ADD VALUE IF NOT EXISTS '${role}'`,
      );
    }
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL does not support DROP VALUE on an enum type. Rolling back
    // would require dropping and recreating the enum, which is destructive
    // if any user row already holds one of the new role values. Intentionally
    // a no-op — restore from a backup if you truly need to revert.
    // eslint-disable-next-line no-console
    console.warn(
      '[AddOrganizationalRoles] down() is a no-op: PostgreSQL cannot DROP enum values without rebuilding the type. Restore from backup if rollback is required.',
    );
  }
}
