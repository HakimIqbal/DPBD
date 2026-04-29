import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not } from 'typeorm';
import { Donation } from '../entities/donation.entity';
import { Program } from '../entities/program.entity';
import { User } from '../entities/user.entity';
import { Investment } from '../entities/investment.entity';
import { Disbursement } from '../entities/disbursement.entity';

export interface DashboardMetrics {
  totalDonations: number;
  totalAmount: number;
  totalDonors: number;
  completedDonations: number;
  pendingDonations: number;
  failedDonations: number;
  refundedDonations: number;
  averageDonation: number;
}

export interface ProgramPerformance {
  id: string;
  title: string;
  targetAmount: number;
  collectedAmount: number;
  donorCount: number;
  progressPercentage: number;
  status: 'draft' | 'active' | 'completed' | 'archived';
}

export interface DonationTrend {
  date: string;
  amount: number;
  count: number;
  donors: number;
}

export interface PaymentMethodStats {
  method: string;
  count: number;
  amount: number;
  percentage: number;
}

export interface RecentDonation {
  id: string;
  donorName: string;
  programTitle: string;
  amount: number;
  status: string;
  createdAt: Date;
  paymentMethod: string;
}

export interface EndowmentAllocation {
  type: string;
  amount: number;
  percentage: number;
}

export interface PublicStats {
  /** Distinct donor (user) count from completed donations. Anonymous/guest
   *  donations with NULL userId are not counted — they don't represent a
   *  unique-donor signal we can attribute. */
  totalDonatur: number;
  /** Sum of `amount` (IDR) across all completed donations. */
  totalDonasi: number;
  /** Count of programs currently `status = 'active'`. */
  totalProgram: number;
  /** ISO timestamp the snapshot was computed. */
  lastUpdated: string;
}

export interface EndowmentSummary {
  /** Sum of principalAmount across all non-liquidated investments. */
  totalCorpus: number;
  /** Sum of currentValue across all non-liquidated investments. */
  totalCurrentValue: number;
  /** Cumulative actualReturnAmount across ALL investments (including liquidated, since past returns count toward total imbal hasil). */
  totalImbalHasil: number;
  /** Sum of completed disbursements; 0 if the table doesn't exist or query fails. */
  totalDisalurkan: number;
  /** ((currentValue - corpus) + imbalHasil) / corpus * 100. 0 when corpus is 0. */
  returnPercentage: number;
  activeInvestments: number;
  allocationByType: EndowmentAllocation[];
  /** ISO timestamp the summary was computed; clients can show "diperbarui …". */
  lastUpdated: string;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(Donation)
    private donationRepository: Repository<Donation>,
    @InjectRepository(Program)
    private programRepository: Repository<Program>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Investment)
    private investmentRepository: Repository<Investment>,
    @InjectRepository(Disbursement)
    private disbursementRepository: Repository<Disbursement>,
  ) {}

  /**
   * Public donation stats for the landing-page hero. Each metric is computed
   * inside its own try/catch so a single broken query (e.g. table missing
   * in a fresh environment) doesn't take the whole endpoint down — failed
   * fields just degrade to 0 rather than 500'ing the page.
   *
   * Distinct donor count uses raw SQL `COUNT(DISTINCT)` because TypeORM's
   * find/count APIs can't express it natively. Anonymous/guest donations
   * (where `userId IS NULL`) are intentionally excluded from the donatur
   * count — they don't represent identifiable repeat donors.
   *
   * Note: ProgramStatus enum is {draft, active, completed, archived} with
   * no 'published' value (verified against the entity), so we count only
   * 'active'. If a 'published' state is added later, expand the filter.
   */
  async getPublicStats(): Promise<PublicStats> {
    let totalDonatur = 0;
    let totalDonasi = 0;
    let totalProgram = 0;

    try {
      const result = await this.donationRepository
        .createQueryBuilder('d')
        .select('COUNT(DISTINCT d."userId")', 'count')
        .where('d.status = :status', { status: 'completed' })
        .andWhere('d."userId" IS NOT NULL')
        .getRawOne<{ count: string }>();
      totalDonatur = Number(result?.count ?? 0);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `getPublicStats: donatur count failed — defaulting to 0 (${message})`,
      );
    }

    try {
      const result = await this.donationRepository
        .createQueryBuilder('d')
        .select('COALESCE(SUM(d.amount), 0)', 'sum')
        .where('d.status = :status', { status: 'completed' })
        .getRawOne<{ sum: string }>();
      // amount is bigint — pg returns a string for safety; coerce.
      totalDonasi = Number(result?.sum ?? 0);
      if (!Number.isFinite(totalDonasi)) totalDonasi = 0;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `getPublicStats: donasi sum failed — defaulting to 0 (${message})`,
      );
    }

    try {
      totalProgram = await this.programRepository.count({
        where: { status: 'active' },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `getPublicStats: program count failed — defaulting to 0 (${message})`,
      );
    }

    return {
      totalDonatur,
      totalDonasi,
      totalProgram,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Public endowment-fund summary for the landing page. Aggregates the
   * investment portfolio (corpus, current value, returns, allocation pie)
   * plus disbursements paid out so far.
   *
   * Money columns are stored as decimal/bigint strings; we coerce to JS
   * Number for the aggregate (IDR amounts comfortably fit in the safe
   * integer range — Number.MAX_SAFE_INTEGER ≈ 9 quadrillion).
   *
   * The disbursements query is wrapped in try/catch so the endpoint stays
   * functional in environments where that table hasn't been created yet
   * (early dev, partial migrations) — totalDisalurkan simply degrades to 0.
   */
  async getEndowmentSummary(): Promise<EndowmentSummary> {
    // 1. Active corpus + current value + allocation come from
    //    non-liquidated investments only — liquidated capital is no longer
    //    part of the working endowment.
    const activeRows = await this.investmentRepository.find({
      where: { status: Not('liquidated') },
    });

    let totalCorpus = 0;
    let totalCurrentValue = 0;
    const allocationMap = new Map<string, number>();

    for (const inv of activeRows) {
      const principal = Number(inv.principalAmount ?? 0);
      const current = Number(inv.currentValue ?? 0);

      totalCorpus += Number.isFinite(principal) ? principal : 0;
      totalCurrentValue += Number.isFinite(current) ? current : 0;

      const prev = allocationMap.get(inv.instrumentType) ?? 0;
      allocationMap.set(
        inv.instrumentType,
        prev + (Number.isFinite(current) ? current : 0),
      );
    }

    // 2. Imbal hasil counts ALL realized returns ever — including those on
    //    instruments that have since been liquidated. That's the whole
    //    point of the metric: lifetime cash returns to the foundation.
    const allInvestments = await this.investmentRepository.find();
    const totalImbalHasil = allInvestments.reduce((acc, inv) => {
      const v = Number(inv.actualReturnAmount ?? 0);
      return acc + (Number.isFinite(v) ? v : 0);
    }, 0);

    // 3. Disbursements: sum amount where status = 'completed'.
    let totalDisalurkan = 0;
    try {
      const completed = await this.disbursementRepository.find({
        where: { status: 'completed' },
      });
      totalDisalurkan = completed.reduce((acc, d) => {
        // amount is bigint — pg returns it as string for safety, so coerce.
        const v = Number(d.amount ?? 0);
        return acc + (Number.isFinite(v) ? v : 0);
      }, 0);
    } catch (err) {
      // Defensive: in environments where the disbursements table isn't
      // created yet (or the query fails for any reason), degrade to 0
      // rather than 500'ing the public endpoint. Log so the issue is
      // visible in monitoring.
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `getEndowmentSummary: disbursements query failed — defaulting totalDisalurkan to 0 (${message})`,
      );
      totalDisalurkan = 0;
    }

    // 4. Return % = (unrealized gain + realized return) / corpus.
    const returnPercentage =
      totalCorpus > 0
        ? ((totalCurrentValue - totalCorpus + totalImbalHasil) / totalCorpus) *
          100
        : 0;

    // 5. Allocation pie — ordered by amount desc so the chart legend
    //    reads naturally top-to-bottom.
    const allocationByType: EndowmentAllocation[] = Array.from(
      allocationMap.entries(),
    )
      .map(([type, amount]) => ({
        type,
        amount,
        percentage:
          totalCurrentValue > 0 ? (amount / totalCurrentValue) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      totalCorpus,
      totalCurrentValue,
      totalImbalHasil,
      totalDisalurkan,
      returnPercentage,
      activeInvestments: activeRows.length,
      allocationByType,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Get overall dashboard metrics
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const donations = await this.donationRepository.find();

    const totalDonations = donations.length;
    const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
    const completedDonations = donations.filter(
      (d) => d.status === 'completed',
    ).length;
    const pendingDonations = donations.filter(
      (d) => d.status === 'pending',
    ).length;
    const failedDonations = donations.filter(
      (d) => d.status === 'failed',
    ).length;
    const refundedDonations = donations.filter(
      (d) => d.status === 'refunded',
    ).length;

    // Count unique non-anonymous donors
    const uniqueDonors = new Set(
      donations.filter((d) => !d.isAnonymous && d.userId).map((d) => d.userId),
    );
    const totalDonors = uniqueDonors.size;

    // Add anonymous donors
    const anonymousDonations = donations.filter((d) => d.isAnonymous).length;

    const completedAmount = donations
      .filter((d) => d.status === 'completed')
      .reduce((sum, d) => sum + d.amount, 0);
    const averageDonation =
      completedDonations > 0
        ? Math.round(completedAmount / completedDonations)
        : 0;

    return {
      totalDonations,
      totalAmount,
      totalDonors: totalDonors + (anonymousDonations > 0 ? 1 : 0),
      completedDonations,
      pendingDonations,
      failedDonations,
      refundedDonations,
      averageDonation,
    };
  }

  /**
   * Get all programs with performance metrics
   */
  async getProgramsPerformance(): Promise<ProgramPerformance[]> {
    const programs = await this.programRepository.find();

    const performanceData = programs.map((program) => {
      const progressPercentage =
        program.targetAmount && program.targetAmount > 0
          ? Math.min(
              Math.round(
                (program.collectedAmount / program.targetAmount) * 100,
              ),
              100,
            )
          : 0;

      return {
        id: program.id,
        title: program.title,
        targetAmount: program.targetAmount || 0,
        collectedAmount: program.collectedAmount || 0,
        donorCount: program.donorCount || 0,
        progressPercentage,
        status: program.status,
      };
    });

    return performanceData.sort(
      (a, b) => b.collectedAmount - a.collectedAmount,
    );
  }

  /**
   * Get donation trends over time
   */
  async getDonationTrends(days: number = 30): Promise<DonationTrend[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const donations = await this.donationRepository.find({
      where: {
        createdAt: Between(startDate, new Date()),
        status: 'completed',
      },
      order: { createdAt: 'ASC' },
    });

    // Group by date
    const trendMap = new Map<
      string,
      { amount: number; count: number; donors: Set<string> }
    >();

    donations.forEach((donation) => {
      const date = new Date(donation.createdAt);
      const dateStr = date.toISOString().split('T')[0];

      if (!trendMap.has(dateStr)) {
        trendMap.set(dateStr, { amount: 0, count: 0, donors: new Set() });
      }

      const trend = trendMap.get(dateStr)!;
      trend.amount += donation.amount;
      trend.count += 1;

      if (!donation.isAnonymous && donation.userId) {
        trend.donors.add(donation.userId);
      }
    });

    // Convert to array and fill gaps
    const result: DonationTrend[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= new Date()) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const trend = trendMap.get(dateStr);

      result.push({
        date: dateStr,
        amount: trend?.amount || 0,
        count: trend?.count || 0,
        donors: trend?.donors.size || 0,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  }

  /**
   * Get payment method distribution
   */
  async getPaymentMethodStats(): Promise<PaymentMethodStats[]> {
    const donations = await this.donationRepository.find({
      where: { status: 'completed' },
    });

    if (donations.length === 0) {
      return [];
    }

    const methodMap = new Map<string, { count: number; amount: number }>();

    donations.forEach((donation) => {
      const method = this.formatPaymentMethod(donation.paymentMethod);

      if (!methodMap.has(method)) {
        methodMap.set(method, { count: 0, amount: 0 });
      }

      const stats = methodMap.get(method)!;
      stats.count += 1;
      stats.amount += donation.amount;
    });

    const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);

    return Array.from(methodMap.entries())
      .map(([method, stats]) => ({
        method,
        count: stats.count,
        amount: stats.amount,
        percentage:
          totalAmount > 0 ? Math.round((stats.amount / totalAmount) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  /**
   * Get top programs by collection
   */
  async getTopPrograms(limit: number = 10): Promise<ProgramPerformance[]> {
    const performance = await this.getProgramsPerformance();
    return performance.slice(0, limit);
  }

  /**
   * Get recent donations
   */
  async getRecentDonations(limit: number = 10): Promise<RecentDonation[]> {
    const donations = await this.donationRepository.find({
      where: { status: 'completed' },
      relations: ['program', 'user'],
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return donations.map((donation) => ({
      id: donation.id,
      donorName: donation.isAnonymous
        ? 'Anonymous'
        : donation.user?.name || 'Unknown',
      programTitle: donation.program?.title || 'Program',
      amount: donation.amount,
      status: donation.status,
      createdAt: donation.createdAt,
      paymentMethod: this.formatPaymentMethod(donation.paymentMethod),
    }));
  }

  /**
   * Get donor statistics
   */
  async getDonorStatistics(): Promise<{
    totalDonors: number;
    uniqueDonors: number;
    anonymousDonors: number;
    repeatDonors: number;
    avgDonationsPerDonor: number;
  }> {
    const donations = await this.donationRepository.find({
      where: { status: 'completed' },
    });

    const uniqueDonorIds = new Set(
      donations.filter((d) => !d.isAnonymous && d.userId).map((d) => d.userId),
    );
    const uniqueDonors = uniqueDonorIds.size;
    const anonymousDonors = donations.filter((d) => d.isAnonymous).length;

    // Count repeat donors
    const donorDonationCount = new Map<string, number>();
    donations.forEach((donation) => {
      if (!donation.isAnonymous && donation.userId) {
        donorDonationCount.set(
          donation.userId,
          (donorDonationCount.get(donation.userId) || 0) + 1,
        );
      }
    });

    const repeatDonors = Array.from(donorDonationCount.values()).filter(
      (count) => count > 1,
    ).length;

    const totalDonations = donations.length;
    const avgDonationsPerDonor =
      uniqueDonors > 0 ? Math.round(totalDonations / uniqueDonors) : 0;

    return {
      totalDonors: uniqueDonors + (anonymousDonors > 0 ? 1 : 0),
      uniqueDonors,
      anonymousDonors,
      repeatDonors,
      avgDonationsPerDonor,
    };
  }

  /**
   * Format payment method name
   */
  private formatPaymentMethod(method: string): string {
    const methodMap: Record<string, string> = {
      virtual_account: 'Virtual Account',
      qris: 'QRIS',
      bank_transfer: 'E-Wallet',
      credit_card: 'Credit Card',
    };
    return methodMap[method] || method;
  }
}
