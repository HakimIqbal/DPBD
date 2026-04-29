import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type {
  DashboardMetrics,
  ProgramPerformance,
  DonationTrend,
  PaymentMethodStats,
  RecentDonation,
} from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  /**
   * Get overall dashboard metrics (admin/finance KPI dashboard)
   * GET /analytics/dashboard
   */
  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'finance')
  async getDashboard(): Promise<DashboardMetrics> {
    return await this.analyticsService.getDashboardMetrics();
  }

  /**
   * Get programs performance — public for transparency
   * GET /analytics/programs
   */
  @Get('programs')
  async getProgramsPerformance(): Promise<ProgramPerformance[]> {
    return await this.analyticsService.getProgramsPerformance();
  }

  /**
   * Get top programs by collection — public for transparency
   * GET /analytics/programs/top
   */
  @Get('programs/top')
  async getTopPrograms(
    @Query('limit') limit: string = '10',
  ): Promise<ProgramPerformance[]> {
    const limitNum = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
    return await this.analyticsService.getTopPrograms(limitNum);
  }

  /**
   * Get donation trends — public for transparency
   * GET /analytics/trends
   */
  @Get('trends')
  async getDonationTrends(
    @Query('days') days: string = '30',
  ): Promise<DonationTrend[]> {
    const daysNum = Math.min(Math.max(parseInt(days) || 30, 1), 365);
    return await this.analyticsService.getDonationTrends(daysNum);
  }

  /**
   * Get payment method statistics — internal (admin/finance only)
   * GET /analytics/payment-methods
   */
  @Get('payment-methods')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'finance')
  async getPaymentMethodStats(): Promise<PaymentMethodStats[]> {
    return await this.analyticsService.getPaymentMethodStats();
  }

  /**
   * Get recent donations — public for transparency
   * GET /analytics/recent
   */
  @Get('recent')
  async getRecentDonations(
    @Query('limit') limit: string = '10',
  ): Promise<RecentDonation[]> {
    const limitNum = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
    return await this.analyticsService.getRecentDonations(limitNum);
  }

  /**
   * Get donor statistics — internal (admin/finance only)
   * GET /analytics/donors
   */
  @Get('donors')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'finance')
  async getDonorStatistics(): Promise<{
    totalDonors: number;
    uniqueDonors: number;
    anonymousDonors: number;
    repeatDonors: number;
    avgDonationsPerDonor: number;
  }> {
    return await this.analyticsService.getDonorStatistics();
  }
}
