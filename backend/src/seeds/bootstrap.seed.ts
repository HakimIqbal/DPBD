import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, AuditLog } from '../entities';

/**
 * Bootstrap a CEO account on first server start so a fresh deployment can
 * sign in immediately without touching SQL. Idempotent — if any user with
 * role='ceo' exists this is a no-op.
 *
 * Credentials come from env vars (CEO_BOOTSTRAP_EMAIL / _PASSWORD /
 * _NAME). Email and name fall back to defaults; password does NOT — if
 * `CEO_BOOTSTRAP_PASSWORD` is unset, the seed logs a warning and skips
 * bootstrap entirely. Hardcoded default passwords in source are exactly
 * what credential scanners flag; fail-closed forces the operator to set
 * a real value via env (or the standalone CLI), and rotate it again
 * after first login.
 *
 * Writes a single audit log entry (`CEO_BOOTSTRAP` / entityType `User`)
 * with `actorId=null` since no one is authenticated at bootstrap time.
 * Audit failure is swallowed — it must never block app start.
 */
export async function bootstrapCEO(dataSource: DataSource): Promise<void> {
  const userRepo = dataSource.getRepository(User);
  const auditRepo = dataSource.getRepository(AuditLog);

  const existing = await userRepo.count({ where: { role: 'ceo' } });
  if (existing > 0) {
    console.log(
      `[Bootstrap] ℹ️  CEO account already exists (${existing} found) — skipping bootstrap.`,
    );
    return;
  }

  const email = process.env.CEO_BOOTSTRAP_EMAIL || 'ceo@dpbd.org';
  const password = process.env.CEO_BOOTSTRAP_PASSWORD;
  const name = process.env.CEO_BOOTSTRAP_NAME || 'CEO DPBD';

  if (!password || password.trim().length < 8) {
    console.warn(
      '[Bootstrap] ⚠️  CEO_BOOTSTRAP_PASSWORD is not set (or shorter than 8 chars). ' +
        'Skipping CEO bootstrap. Set it in backend/.env (gitignored) and restart, ' +
        'or run `npx ts-node src/scripts/create-ceo.ts` after setting the env.',
    );
    return;
  }

  // Edge case: somebody could have an account at this email under a
  // different role (admin promoted via SQL, for example). Don't clobber —
  // surface the collision and bail. The operator can either rename the
  // existing user or change CEO_BOOTSTRAP_EMAIL.
  const collision = await userRepo.findOne({ where: { email } });
  if (collision) {
    console.warn(
      `[Bootstrap] ⚠️  Cannot bootstrap CEO: email "${email}" already taken by role="${collision.role}". ` +
        `Set CEO_BOOTSTRAP_EMAIL to a different address or update the existing user's role manually.`,
    );
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const ceo = userRepo.create({
    email,
    password: hashedPassword,
    name,
    role: 'ceo',
    status: 'active',
    isActive: true,
  });

  const saved = await userRepo.save(ceo);

  console.log(
    `[Bootstrap] ✅ CEO account created: ${saved.email} (id=${saved.id}). ` +
      `Default password is in use — CHANGE IT after first login.`,
  );

  // Audit the bootstrap. Wrapped in its own try/catch so an audit-table
  // failure (missing table, constraint, etc.) doesn't roll back the
  // user creation we just did.
  try {
    const log = auditRepo.create({
      actorId: null,
      actorRole: null,
      actorEmail: null,
      action: 'CEO_BOOTSTRAP',
      entityType: 'User',
      entityId: saved.id,
      metadata: {
        email: saved.email,
        source: process.env.CEO_BOOTSTRAP_EMAIL ? 'env' : 'default',
      },
      ipAddress: null,
      userAgent: null,
    });
    await auditRepo.save(log);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(
      `[Bootstrap] ⚠️  CEO created but audit log write failed: ${message}`,
    );
  }
}
