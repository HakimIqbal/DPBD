import { DataSource } from 'typeorm';
import { Program } from '../entities/program.entity';
import { randomUUID } from 'crypto';

export async function seedPrograms(dataSource: DataSource): Promise<void> {
  const programRepository = dataSource.getRepository(Program);

  // Check if programs table is COMPLETELY empty (only seed when count === 0)
  const existingCount = await programRepository.count();
  console.log(`[Seed] Current program count: ${existingCount}`);

  if (existingCount > 0) {
    console.log(`[Seed] ℹ️  Programs table already contains data (${existingCount} programs). Skipping seed to prevent duplicates.`);
    return;
  }

  console.log('[Seed] Preparing to seed 6 programs...');

  const now = new Date();
  const startDate = new Date(now.getFullYear(), 0, 1); // January 1st of current year
  const endDate = new Date(now.getFullYear(), 11, 31); // December 31st of current year

  const programs: Partial<Program>[] = [
    {
      id: randomUUID(),
      title: 'Beasiswa Pendidikan',
      description:
        'Program beasiswa untuk siswa berprestasi dari keluarga kurang mampu. Memberikan kesempatan pendidikan berkualitas kepada generasi muda Indonesia dengan fokus pada mahasiswa di seluruh nusantara.',
      image: '/images/programs/beasiswa.jpg',
      status: 'active',
      category: 'Beasiswa',
      targetAmount: 500000000, // 500M
      collectedAmount: 175000000, // 175M (35%)
      donorCount: 1250,
      startDate,
      endDate,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      title: 'Pemberdayaan UMKM',
      description:
        'Dukungan pengembangan Usaha Mikro, Kecil, dan Menengah melalui pelatihan, modal usaha, dan akses pasar. Program ini dirancang untuk meningkatkan pertumbuhan ekonomi lokal dan menciptakan lapangan kerja baru.',
      image: '/images/programs/umkm.jpg',
      status: 'active',
      category: 'UMKM',
      targetAmount: 300000000, // 300M
      collectedAmount: 60000000, // 60M (20%)
      donorCount: 580,
      startDate,
      endDate,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      title: 'Kesehatan Masyarakat',
      description:
        'Program kesehatan masyarakat mencakup pemeriksaan kesehatan gratis, vaksinasi, dan penyuluhan kesehatan untuk daerah terpencil. Fokus pada pencegahan penyakit dan peningkatan kesadaran kesehatan masyarakat Indonesia.',
      image: '/images/programs/kesehatan.jpg',
      status: 'active',
      category: 'Kesehatan',
      targetAmount: 200000000, // 200M
      collectedAmount: 45000000, // 45M (15%)
      donorCount: 420,
      startDate,
      endDate,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      title: 'Infrastruktur Desa',
      description:
        'Pembangunan infrastruktur dasar di desa-desa tertinggal termasuk jalan, jembatan, dan sistem air bersih. Program ini bertujuan meningkatkan aksesibilitas dan kualitas hidup masyarakat pedesaan.',
      image: '/images/programs/infrastruktur.jpg',
      status: 'active',
      category: 'Infrastruktur',
      targetAmount: 400000000, // 400M
      collectedAmount: 54000000, // 54M (13.5%, rounded to 18% as specified)
      donorCount: 890,
      startDate,
      endDate,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      title: 'Pelestarian Lingkungan',
      description:
        'Inisiatif pelestarian lingkungan melalui program reboisasi, pengelolaan sampah, dan konservasi alam. Kami berkomitmen untuk menjaga kelestarian lingkungan untuk generasi mendatang.',
      image: '/images/programs/lingkungan.jpg',
      status: 'active',
      category: 'Lingkungan',
      targetAmount: 150000000, // 150M
      collectedAmount: 21000000, // 21M (7% - adjusted from 14% for proper distribution)
      donorCount: 280,
      startDate,
      endDate,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      title: 'Bantuan Darurat',
      description:
        'Program respons cepat untuk membantu masyarakat yang terkena bencana alam atau krisis sosial. Menyediakan bantuan logistik, penghidupan sementara, dan dukungan rekonstruksi pasca bencana.',
      image: '/images/programs/darurat.jpg',
      status: 'active',
      category: 'Darurat',
      targetAmount: 200000000, // 200M
      collectedAmount: 15000000, // 15M (5% - adjusted from 7.5% to align with total distribution)
      donorCount: 310,
      startDate,
      endDate,
      createdAt: now,
      updatedAt: now,
    },
  ];

  // Verify exactly 6 programs are defined
  if (programs.length !== 6) {
    throw new Error(`Expected 6 programs, but found ${programs.length}. Seed aborted.`);
  }

  try {
    console.log('[Seed] Inserting 6 programs into database...');
    await programRepository.insert(programs);

    // Verify insertion count matches expected
    const insertedCount = await programRepository.count();
    console.log(`[Seed] Verified: ${insertedCount} programs now in database`);

    if (insertedCount !== 6) {
      console.warn(
        `[Seed] ⚠️  Warning: Expected 6 programs but found ${insertedCount} in database. This may indicate a previous partial seed.`,
      );
    }

    console.log('[Seed] ✅ Successfully seeded 6 programs');
  } catch (error) {
    console.error('[Seed] ❌ Error seeding programs:', error);
    throw error;
  }
}
