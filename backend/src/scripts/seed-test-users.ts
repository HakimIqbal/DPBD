/**
 * Seed test users for the role-specific dashboards (CFO, Investment
 * Manager, Risk Manager, Dewan Pembina, Dewan Pengawas) plus a
 * baseline admin. Idempotent — re-running rotates the password +
 * confirms the role on existing rows.
 *
 * Password is read from `TEST_USERS_PASSWORD` env var. We deliberately
 * refuse to ship a hardcoded default: passwords in source go straight
 * onto a public mirror (it's how we got a GitGuardian alert in the
 * first place), and a default that says "fail closed" forces the team
 * to share a value over a real channel (1Password, signed Slack DM, etc.).
 *
 * Usage:
 *   TEST_USERS_PASSWORD=<your-shared-value> npx ts-node src/scripts/seed-test-users.ts
 *
 * Or put TEST_USERS_PASSWORD in backend/.env (gitignored) and run:
 *   npx ts-node src/scripts/seed-test-users.ts
 */
import 'dotenv/config';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { AppDataSource } from '../data-source';
import { User } from '../entities';
import type { UserRole } from '../entities/user.entity';

interface TestAccount {
  email: string;
  name: string;
  role: UserRole;
}

const ACCOUNTS: TestAccount[] = [
  { email: 'cfo-test@example.com', name: 'Test CFO', role: 'cfo' },
  { email: 'im-test@example.com', name: 'Test Investment Manager', role: 'investment_manager' },
  { email: 'risk-test@example.com', name: 'Test Risk Manager', role: 'risk_manager' },
  { email: 'pembina-test@example.com', name: 'Test Dewan Pembina', role: 'dewan_pembina' },
  { email: 'pengawas-test@example.com', name: 'Test Dewan Pengawas', role: 'dewan_pengawas' },
];

async function main(): Promise<void> {
  const password = process.env.TEST_USERS_PASSWORD;
  if (!password || password.trim().length < 8) {
    console.error('');
    console.error('❌ TEST_USERS_PASSWORD env var is required (min 8 chars).');
    console.error('');
    console.error('   Ask a teammate for the team-shared dev password and add it to');
    console.error('   backend/.env (which is gitignored), or pass inline:');
    console.error('');
    console.error('     TEST_USERS_PASSWORD=<value> npx ts-node src/scripts/seed-test-users.ts');
    console.error('');
    process.exit(1);
  }

  console.log(`=== Seeding ${ACCOUNTS.length} test users ===`);
  console.log('');

  await AppDataSource.initialize();
  try {
    const repo = AppDataSource.getRepository(User);
    const hashed = await bcrypt.hash(password, 10);

    for (const acc of ACCOUNTS) {
      const existing = await repo.findOne({ where: { email: acc.email } });
      if (existing) {
        existing.password = hashed;
        existing.role = acc.role;
        existing.name = acc.name;
        existing.status = 'active';
        existing.isActive = true;
        await repo.save(existing);
        console.log(`  [updated] ${acc.role.padEnd(20)} ${acc.email}`);
      } else {
        await repo.insert({
          id: randomUUID(),
          email: acc.email,
          password: hashed,
          name: acc.name,
          role: acc.role,
          status: 'active',
          isActive: true,
        });
        console.log(`  [created] ${acc.role.padEnd(20)} ${acc.email}`);
      }
    }

    console.log('');
    console.log('Login emails (password = TEST_USERS_PASSWORD env value):');
    for (const acc of ACCOUNTS) {
      console.log(`  ${acc.role.padEnd(20)} → ${acc.email}`);
    }
    console.log('');
    console.log('Password is NOT printed here — it lives in your local .env, not in source.');
  } finally {
    await AppDataSource.destroy();
  }
}

main().catch((err) => {
  console.error('Seed test users failed:', err);
  process.exit(1);
});
