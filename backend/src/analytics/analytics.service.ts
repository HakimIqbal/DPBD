import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Donation } from '../entities/donation.entity';
import { Program } from '../entities/program.entity';
import { User } from '../entities/user.entity';

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

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Donation)
    private donationRepository: Repository<Donation>,
    @InjectRepository(Program)
    private programRepository: Repository<Program>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

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
