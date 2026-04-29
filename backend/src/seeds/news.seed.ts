import { DataSource } from 'typeorm';
import { News, User } from '../entities';

/**
 * Seed 3 published news articles for the landing page demo.
 * Idempotent: skipped if any news rows exist. Requires at least one
 * admin user to use as authorId (FK constraint).
 */
export async function seedNews(dataSource: DataSource): Promise<void> {
  const newsRepo = dataSource.getRepository(News);
  const userRepo = dataSource.getRepository(User);

  const existing = await newsRepo.count();
  console.log(`[Seed] Current news count: ${existing}`);

  if (existing > 0) {
    console.log(
      `[Seed] ℹ️  News table already contains data (${existing}). Skipping to prevent duplicates.`,
    );
    return;
  }

  const admin = await userRepo.findOne({
    where: { role: 'admin' },
    order: { createdAt: 'ASC' },
  });

  if (!admin) {
    console.warn(
      '[Seed] ⚠️  No admin user found — skipping news seed (authorId is required).',
    );
    return;
  }

  const now = new Date();

  const items: Partial<News>[] = [
    {
      title: 'Dana Abadi PPI Dunia Resmi Tembus Rp 5 Miliar',
      content:
        'Dana Pendidikan Berkelanjutan dan Berdampak (DPBD) PPI Dunia berhasil menghimpun lebih dari Rp 5 miliar dari kontribusi alumni dan mitra strategis di 50+ negara. Capaian ini menjadi tonggak penting dalam membangun ketahanan pendanaan jangka panjang untuk program beasiswa, riset, dan pemberdayaan diaspora pelajar Indonesia.\n\nMenurut Ketua Dewan Pembina, dana abadi yang dikelola secara prudent dengan portofolio syariah-compliant ini diproyeksikan dapat membiayai 200+ penerima manfaat per tahun secara berkelanjutan. Strategi investasi difokuskan pada instrumen sukuk negara, deposito syariah, dan reksa dana syariah dengan target imbal hasil 6–8% per tahun.\n\n"Setiap rupiah yang masuk akan terus bekerja, bukan habis dalam satu kali penyaluran," jelas perwakilan tim Investment Manager. Laporan transparansi triwulanan dapat diakses publik melalui dashboard transparansi DPBD.',
      image: '/images/news/milestone-5m.jpg',
      authorId: admin.id,
      isPublished: true,
      publishedAt: now,
    },
    {
      title: 'Beasiswa Riset Diaspora 2026 Dibuka untuk 30 Penerima',
      content:
        'DPBD bekerja sama dengan PPI Dunia membuka program Beasiswa Riset Diaspora untuk 30 mahasiswa S2 dan S3 yang sedang menempuh studi di luar negeri. Program ini memberikan dukungan penelitian sebesar Rp 25 juta per penerima, dengan prioritas riset di bidang energi terbarukan, kesehatan masyarakat, dan kebijakan publik.\n\nPendaftaran dibuka mulai 1 Mei hingga 30 Juni 2026. Seleksi mencakup penilaian proposal riset, dampak terhadap Indonesia, dan rekam jejak akademik. Pengumuman akan dilakukan pada Agustus 2026 dengan pencairan dana mulai September 2026.\n\nSeluruh dana berasal dari hasil pengelolaan dana abadi DPBD — pokok dana tetap utuh, hanya imbal hasilnya yang disalurkan. Skema ini memastikan beasiswa dapat terus berjalan tahun demi tahun tanpa menggerus modal donasi yang sudah masuk.',
      image: '/images/news/beasiswa-riset.jpg',
      authorId: admin.id,
      isPublished: true,
      publishedAt: now,
    },
    {
      title: 'Audit Eksternal Q1 2026: Opini Wajar Tanpa Pengecualian',
      content:
        'Hasil audit eksternal triwulan pertama 2026 atas pengelolaan Dana Abadi PPI Dunia memberikan opini Wajar Tanpa Pengecualian (WTP). Audit dilakukan oleh Kantor Akuntan Publik independen dengan ruang lingkup mencakup penerimaan donasi, alokasi portofolio investasi, penyaluran beasiswa, serta kepatuhan terhadap prinsip syariah.\n\nLaporan audit lengkap, termasuk neraca, laporan arus kas, dan rincian portofolio per instrumen, telah dipublikasikan di halaman Transparansi situs DPBD. Setiap donatur dapat melacak alokasi dananya hingga ke level program penerima.\n\nDewan Pembina menegaskan komitmen pada tata kelola yang akuntabel: rapat triwulanan terbuka, audit tahunan independen, dan dashboard real-time yang memantau rasio biaya operasional di bawah 5% dari total dana terkelola.',
      image: '/images/news/audit-wtp.jpg',
      authorId: admin.id,
      isPublished: true,
      publishedAt: now,
    },
  ];

  try {
    console.log('[Seed] Inserting 3 news articles...');
    await newsRepo.insert(items);
    const after = await newsRepo.count();
    console.log(`[Seed] ✅ Seeded ${after} news articles`);
  } catch (error) {
    console.error('[Seed] ❌ Error seeding news:', error);
    throw error;
  }
}
