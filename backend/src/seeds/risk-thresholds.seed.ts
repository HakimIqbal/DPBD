import { DataSource } from 'typeorm';
import { RiskThreshold } from '../entities';

/**
 * Seed 3 default risk thresholds the Risk Manager can tune later.
 * Idempotent: skipped when the table already has any rows. Numbers are
 * stored as decimal(18,4) — pass them as strings to keep precision and
 * avoid the implicit float round-trip.
 */
export async function seedRiskThresholds(
  dataSource: DataSource,
): Promise<void> {
  const repo = dataSource.getRepository(RiskThreshold);

  const existing = await repo.count();
  console.log(`[Seed] Current risk threshold count: ${existing}`);

  if (existing > 0) {
    console.log(
      `[Seed] ℹ️  Risk thresholds table already contains data (${existing}). Skipping to prevent duplicates.`,
    );
    return;
  }

  const seeds: Partial<RiskThreshold>[] = [
    {
      name: 'Konsentrasi Sukuk',
      metricKey: 'sukuk_percentage',
      operator: 'greater_than',
      thresholdValue: '60.0000',
      severity: 'warning',
      isActive: true,
      description:
        'Alokasi sukuk yang melebihi 60% dari total portofolio dianggap konsentrasi tinggi pada satu kelas instrumen — disarankan untuk melakukan rebalancing demi diversifikasi.',
    },
    {
      name: 'Konsentrasi Instrumen Tunggal',
      metricKey: 'single_instrument_percentage',
      operator: 'greater_than',
      thresholdValue: '40.0000',
      severity: 'critical',
      isActive: true,
      description:
        'Tidak ada satu pun kategori instrumen yang boleh melampaui 40% dari total nilai portofolio. Pelanggaran menandakan eksposur idiosinkratik yang berlebihan.',
    },
    {
      name: 'Minimum Diversifikasi',
      metricKey: 'active_instruments',
      operator: 'less_than',
      thresholdValue: '3.0000',
      severity: 'warning',
      isActive: true,
      description:
        'Portofolio harus menahan minimal 3 instrumen aktif sekaligus. Di bawah angka ini, risiko spesifik instrumen menjadi dominan terhadap risiko pasar agregat.',
    },
  ];

  try {
    console.log('[Seed] Inserting 3 default risk thresholds...');
    await repo.insert(seeds);
    const after = await repo.count();
    console.log(`[Seed] ✅ Seeded ${after} risk thresholds`);
  } catch (error) {
    console.error('[Seed] ❌ Error seeding risk thresholds:', error);
    throw error;
  }
}
