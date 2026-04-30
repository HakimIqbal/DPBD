import { DataSource } from 'typeorm';
import { Disbursement } from '../entities/disbursement.entity';
import { Program } from '../entities/program.entity';
import { User } from '../entities/user.entity';

/**
 * Seed 3 pending disbursement requests so the CFO approval queue has
 * something to render in dev. Idempotent: skipped if any rows exist.
 *
 * Picks the first 3 active programs as targets and the first finance
 * user as the requester. If either is missing, the seed bails with a
 * warning rather than failing — fresh DBs without finance users get
 * the empty-state UI, which is also a valid demo path.
 */
export async function seedDisbursements(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(Disbursement);
  const programRepo = dataSource.getRepository(Program);
  const userRepo = dataSource.getRepository(User);

  const existing = await repo.count();
  console.log(`[Seed] Current disbursement count: ${existing}`);
  if (existing > 0) {
    console.log(
      `[Seed] ℹ️  Disbursements table already contains data (${existing}). Skipping.`,
    );
    return;
  }

  const programs = await programRepo.find({
    where: { status: 'active' },
    order: { createdAt: 'ASC' },
    take: 3,
  });
  if (programs.length === 0) {
    console.warn(
      '[Seed] ⚠️  No active programs — skipping disbursement seed.',
    );
    return;
  }

  const finance = await userRepo.findOne({
    where: { role: 'finance' },
    order: { createdAt: 'ASC' },
  });
  // Finance user is optional — without one, requestedBy stays null.
  // The UI handles that case ("—" in the "Diajukan Oleh" column).
  const requestedById = finance?.id ?? null;
  if (!finance) {
    console.log(
      '[Seed] ℹ️  No finance user found — disbursements will have null requestedBy.',
    );
  }

  const now = new Date();
  const seeds: Partial<Disbursement>[] = [
    {
      programId: programs[0].id,
      recipient: 'Penerima Beasiswa Batch April 2026 (12 mahasiswa)',
      amount: 60_000_000,
      date: now,
      status: 'pending',
      description:
        'Penyaluran tahap pertama beasiswa pendidikan untuk 12 mahasiswa diaspora — sesuai daftar lolos seleksi Maret 2026.',
      requestedBy: requestedById,
      requestedAt: now,
    },
    {
      programId: programs[Math.min(1, programs.length - 1)].id,
      recipient: 'PT Karya Diaspora Indonesia (UMKM mitra)',
      amount: 25_000_000,
      date: now,
      status: 'pending',
      description:
        'Modal usaha tahap II untuk UMKM mitra di Bandung. Proposal sudah diverifikasi tim partnership.',
      requestedBy: requestedById,
      requestedAt: now,
    },
    {
      programId: programs[Math.min(2, programs.length - 1)].id,
      recipient: 'Klinik Kesehatan Desa Sukamulya',
      amount: 15_000_000,
      date: now,
      status: 'pending',
      description:
        'Bantuan operasional kuartalan untuk klinik desa — pembelian obat dan honor tenaga kesehatan.',
      requestedBy: requestedById,
      requestedAt: now,
    },
  ];

  try {
    console.log('[Seed] Inserting 3 pending disbursements...');
    await repo.insert(seeds);
    const after = await repo.count();
    console.log(`[Seed] ✅ Seeded ${after} disbursements (status=pending)`);
  } catch (error) {
    console.error('[Seed] ❌ Error seeding disbursements:', error);
    throw error;
  }
}
