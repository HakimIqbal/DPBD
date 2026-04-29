/**
 * Standalone CEO bootstrap CLI. Useful when:
 *   - Auto-bootstrap is disabled in production
 *   - You wiped the users table and need to reseat the CEO without restarting
 *   - You want to override env values for a one-off creation
 *
 * Usage:
 *   npx ts-node src/scripts/create-ceo.ts
 *
 * The script reads the same env vars the bootstrap seed reads
 * (CEO_BOOTSTRAP_EMAIL / _PASSWORD / _NAME) and is idempotent — if a CEO
 * already exists, it logs and exits 0 without changes. Exits non-zero
 * only on database / hashing failures so CI pipelines can detect them.
 */
import 'dotenv/config';
import { AppDataSource } from '../data-source';
import { bootstrapCEO } from '../seeds/bootstrap.seed';

async function main(): Promise<void> {
  console.log('=== DPBD CEO bootstrap (standalone) ===');
  console.log(
    `Target email: ${process.env.CEO_BOOTSTRAP_EMAIL || 'ceo@dpbd.org'} (set CEO_BOOTSTRAP_EMAIL to override)`,
  );
  console.log('');

  await AppDataSource.initialize();
  try {
    await bootstrapCEO(AppDataSource);
    console.log('');
    console.log('Done. If a new account was created, change the password immediately via:');
    console.log('  POST /api/auth/login   →   then   PATCH /api/users/profile');
  } finally {
    await AppDataSource.destroy();
  }
}

main().catch((err) => {
  console.error('CEO bootstrap script failed:', err);
  process.exit(1);
});
