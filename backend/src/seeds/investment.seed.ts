import { DataSource } from 'typeorm';
import { Investment } from '../entities';

/**
 * Seed 6 representative investment instruments for development:
 *   - 2 reksa dana (active, different institutions)
 *   - 2 sukuk (1 active, 1 matured)
 *   - 1 deposito syariah (active)
 *   - 1 saham syariah (active, no expected return rate — equity)
 *
 * Idempotent: skipped when the table already has any rows. The seed uses
 * realistic IDR amounts (100M – 500M) and shariah-compatible return rates
 * (5% – 8% p.a.) so the portfolio dashboards have plausible numbers.
 */
export async function seedInvestments(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(Investment);

  const existing = await repo.count();
  console.log(`[Seed] Current investment count: ${existing}`);

  if (existing > 0) {
    console.log(
      `[Seed] ℹ️  Investments table already contains data (${existing}). Skipping to prevent duplicates.`,
    );
    return;
  }

  // All values are illustrative; swap with real positions before any
  // external reporting. principalAmount is what we put in; currentValue
  // reflects mark-to-market (or face value for held-to-maturity sukuk).
  const seeds: Partial<Investment>[] = [
    {
      name: 'Reksa Dana Syariah Mandiri Seri 1',
      instrumentType: 'reksa_dana',
      institution: 'Bank Mandiri Syariah',
      principalAmount: '250000000.00',
      currentValue: '263500000.00',
      purchaseDate: '2025-08-15',
      expectedReturnRate: '7.50',
      actualReturnAmount: '13500000.00',
      status: 'active',
      notes: 'NAB +5.4% sejak pembelian; auto-rebalance kuartalan.',
    },
    {
      name: 'Reksa Dana Syariah BNI AM Dana Berkah',
      instrumentType: 'reksa_dana',
      institution: 'BNI Asset Management',
      principalAmount: '150000000.00',
      currentValue: '156000000.00',
      purchaseDate: '2025-11-02',
      expectedReturnRate: '6.80',
      actualReturnAmount: '6000000.00',
      status: 'active',
      notes: null,
    },
    {
      name: 'Sukuk Negara Ritel SR-019',
      instrumentType: 'sukuk',
      institution: 'Pemerintah RI (Kementerian Keuangan)',
      principalAmount: '500000000.00',
      currentValue: '500000000.00',
      purchaseDate: '2025-03-10',
      maturityDate: '2028-03-10',
      expectedReturnRate: '6.40',
      actualReturnAmount: '32000000.00',
      status: 'active',
      notes: 'Kupon dibayar bulanan, held-to-maturity.',
    },
    {
      name: 'Sukuk Korporasi PLN Syariah Tahap 2',
      instrumentType: 'sukuk',
      institution: 'PT PLN (Persero)',
      principalAmount: '200000000.00',
      currentValue: '215000000.00',
      purchaseDate: '2022-06-01',
      maturityDate: '2025-06-01',
      expectedReturnRate: '7.10',
      actualReturnAmount: '42600000.00',
      status: 'matured',
      notes: 'Pokok + kupon final telah diterima; menunggu liquidation entry.',
    },
    {
      name: 'Deposito Syariah BSI iB',
      instrumentType: 'deposito_syariah',
      institution: 'Bank Syariah Indonesia',
      principalAmount: '300000000.00',
      currentValue: '300000000.00',
      purchaseDate: '2025-09-20',
      maturityDate: '2026-09-20',
      expectedReturnRate: '5.25',
      actualReturnAmount: '7875000.00',
      status: 'active',
      notes: 'Auto-roll-over, bagi hasil dibayar bulanan.',
    },
    {
      name: 'Saham Syariah ISSI – Portofolio Strategis',
      instrumentType: 'saham_syariah',
      institution: 'IDX Islamic / Self-managed',
      principalAmount: '120000000.00',
      currentValue: '134700000.00',
      purchaseDate: '2025-02-12',
      // Equity has no stated rate — leave nullable.
      expectedReturnRate: null,
      actualReturnAmount: '14700000.00',
      status: 'active',
      notes: 'Diversifikasi: TLKM, ANTM, UNVR, ICBP, BTPS.',
    },
  ];

  if (seeds.length !== 6) {
    throw new Error(
      `Expected 6 investment seeds, found ${seeds.length}. Aborting.`,
    );
  }

  try {
    console.log('[Seed] Inserting 6 investments...');
    await repo.insert(seeds);
    const after = await repo.count();
    console.log(`[Seed] ✅ Seeded ${after} investments`);
  } catch (error) {
    console.error('[Seed] ❌ Error seeding investments:', error);
    throw error;
  }
}
