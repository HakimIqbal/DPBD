import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Donation } from '../entities/donation.entity';
import {
  TierLevel,
  DonorPreferencesDto,
  SearchDonorsDto,
} from './dto/donor.dto';

export interface DonorProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  address: string | null;
  city: string | null;
  zipCode: string | null;
  totalDonated: number;
  totalDonations: number;
  averageDonation: number;
  lastDonationDate: Date | null;
  tier: TierLevel;
  memberSince: Date;
  isActive: boolean;
}

export interface DonationHistoryItem {
  id: string;
  programTitle: string;
  amount: number;
  status: string;
  date: Date;
  paymentMethod: string;
  receiptUrl: string | null;
}

export interface DonorPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  monthlyReports: boolean;
  publicProfile: boolean;
  allowCommunications: boolean;
  preferredLanguage: 'id' | 'en';
}

export interface CommunicationLog {
  id: string;
  type: 'email' | 'sms' | 'call';
  subject: string;
  date: Date;
  status: 'sent' | 'failed' | 'pending';
}

export interface LoyaltyStatus {
  tier: TierLevel;
  pointsBalance: number;
  nextTierThreshold: number;
  rewardsBenefits: string[];
  membershipDays: number;
}

@Injectable()
export class DonorService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Donation)
    private donationRepository: Repository<Donation>,
  ) {}

  /**
   * Get complete donor profile with statistics
   */
  async getDonorProfile(userId: string): Promise<DonorProfile> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Donor not found');
    }

    const donations = await this.donationRepository.find({
      where: { userId, status: 'completed' },
    });

    const totalDonated = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
    const totalDonations = donations.length;
    const averageDonation =
      totalDonations > 0 ? totalDonated / totalDonations : 0;

    const lastDonation = donations.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0];

    const tier = this.calculateTier(totalDonated);

    return {
      id: user.id,
      name: user.name || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || null,
      address: user.address || null,
      city: user.city || null,
      zipCode: user.zipCode || null,
      totalDonated,
      totalDonations,
      averageDonation: Math.round(averageDonation * 100) / 100,
      lastDonationDate: lastDonation?.createdAt || null,
      tier,
      memberSince: user.createdAt,
      isActive: user.isActive ?? true,
    };
  }

  /**
   * Get donor donation history with pagination
   */
  async getDonationHistory(
    userId: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<{
    items: DonationHistoryItem[];
    total: number;
    hasMore: boolean;
  }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Donor not found');
    }

    const [donations, total] = await this.donationRepository.findAndCount({
      where: { userId },
      relations: ['program'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    const items = donations.map((d) => ({
      id: d.id,
      programTitle: d.program?.title || 'Unknown Program',
      amount: d.amount,
      status: d.status,
      date: d.createdAt,
      paymentMethod: d.paymentMethod || 'Unknown',
      receiptUrl: null,
    }));

    return {
      items,
      total,
      hasMore: offset + limit < total,
    };
  }

  /**
   * Get donor communication preferences
   */
  async getPreferences(userId: string): Promise<DonorPreferences> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Donor not found');
    }

    return {
      emailNotifications: user.emailNotifications ?? true,
      smsNotifications: user.smsNotifications ?? false,
      monthlyReports: user.monthlyReports ?? true,
      publicProfile: user.publicProfile ?? false,
      allowCommunications: user.allowCommunications ?? true,
      preferredLanguage: (user.preferredLanguage as 'id' | 'en') || 'id',
    };
  }

  /**
   * Update donor communication preferences
   */
  async updatePreferences(
    userId: string,
    preferences: DonorPreferencesDto,
  ): Promise<DonorPreferences> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Donor not found');
    }

    user.emailNotifications =
      preferences.emailNotifications ?? user.emailNotifications;
    user.smsNotifications =
      preferences.smsNotifications ?? user.smsNotifications;
    user.monthlyReports = preferences.monthlyReports ?? user.monthlyReports;
    user.publicProfile = preferences.publicProfile ?? user.publicProfile;
    user.allowCommunications =
      preferences.allowCommunications ?? user.allowCommunications;
    user.preferredLanguage =
      preferences.preferredLanguage ?? user.preferredLanguage;

    await this.userRepository.save(user);

    return this.getPreferences(userId);
  }

  /**
   * Get donor loyalty and tier status
   */
  async getLoyaltyStatus(userId: string): Promise<LoyaltyStatus> {
    const profile = await this.getDonorProfile(userId);

    const nextTierThresholds = {
      [TierLevel.BRONZE]: 500000,
      [TierLevel.SILVER]: 2000000,
      [TierLevel.GOLD]: 5000000,
      [TierLevel.PLATINUM]: Infinity,
    };

    const rewardsBenefits = {
      [TierLevel.BRONZE]: [
        'Tax deductible receipt',
        'Email updates',
        'Thank you letter',
      ],
      [TierLevel.SILVER]: [
        'All Bronze benefits',
        'Quarterly impact report',
        'Special events invitation',
      ],
      [TierLevel.GOLD]: [
        'All Silver benefits',
        'Annual recognition',
        'One-on-one impact meeting',
        'VIP event access',
      ],
      [TierLevel.PLATINUM]: [
        'All Gold benefits',
        'Lifetime membership recognition',
        'Executive board updates',
        'Custom giving plan',
      ],
    };

    const membershipDays = Math.floor(
      (Date.now() - profile.memberSince.getTime()) / (1000 * 60 * 60 * 24),
    );

    return {
      tier: profile.tier,
      pointsBalance: Math.floor(profile.totalDonated / 1000),
      nextTierThreshold: nextTierThresholds[profile.tier],
      rewardsBenefits: rewardsBenefits[profile.tier],
      membershipDays,
    };
  }

  /**
   * Search donors with filters
   */
  async searchDonors(
    filters: SearchDonorsDto,
    limit: number = 20,
  ): Promise<DonorProfile[]> {
    let query = this.userRepository.createQueryBuilder('user');

    if (filters.name) {
      query = query.andWhere('user.name ILIKE :name', {
        name: `%${filters.name}%`,
      });
    }

    if (filters.email) {
      query = query.andWhere('user.email ILIKE :email', {
        email: `%${filters.email}%`,
      });
    }

    if (filters.city) {
      query = query.andWhere('user.city ILIKE :city', {
        city: `%${filters.city}%`,
      });
    }

    if (filters.isActive !== undefined) {
      query = query.andWhere('user.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    query = query.take(limit);

    const users = await query.getMany();

    const profiles: DonorProfile[] = [];

    for (const user of users) {
      const profile = await this.getDonorProfile(user.id);

      if (!filters.tier || profile.tier === filters.tier) {
        profiles.push(profile);
      }
    }

    return profiles.slice(0, limit);
  }

  /**
   * Get analytics for a donor
   */
  async getDonorAnalytics(userId: string): Promise<{
    totalDonated: number;
    programPreferences: Array<{ programId: string; count: number }>;
    donationFrequency: 'one-time' | 'occasional' | 'regular' | 'frequent';
    lastDonation: Date | null;
  }> {
    const donations = await this.donationRepository.find({
      where: { userId, status: 'completed' },
      relations: ['program'],
    });

    if (donations.length === 0) {
      return {
        totalDonated: 0,
        programPreferences: [],
        donationFrequency: 'one-time',
        lastDonation: null,
      };
    }

    const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);

    // Calculate program preferences
    const programCounts = new Map<string, number>();
    for (const donation of donations) {
      const programId = donation.program?.id || 'unknown';
      programCounts.set(programId, (programCounts.get(programId) || 0) + 1);
    }

    const programPreferences = Array.from(programCounts.entries()).map(
      ([programId, count]) => ({
        programId,
        count,
      }),
    );

    // Calculate donation frequency
    let donationFrequency: 'one-time' | 'occasional' | 'regular' | 'frequent' =
      'one-time';

    if (donations.length >= 2) {
      const sortedDates = donations
        .map((d) => new Date(d.createdAt).getTime())
        .sort((a, b) => b - a);

      const intervalDays =
        (sortedDates[0] - sortedDates[sortedDates.length - 1]) /
        (1000 * 60 * 60 * 24) /
        donations.length;

      if (intervalDays <= 30) {
        donationFrequency = 'frequent';
      } else if (intervalDays <= 90) {
        donationFrequency = 'regular';
      } else if (intervalDays <= 365) {
        donationFrequency = 'occasional';
      }
    }

    const lastDonation = donations.length > 0 ? donations[0].createdAt : null;

    return {
      totalDonated,
      programPreferences,
      donationFrequency,
      lastDonation,
    };
  }

  /**
   * Calculate donor tier based on donation metrics
   */
  private calculateTier(totalDonated: number): TierLevel {
    // Tier based on total donated amount
    if (totalDonated >= 5000000) {
      return TierLevel.PLATINUM;
    } else if (totalDonated >= 2000000) {
      return TierLevel.GOLD;
    } else if (totalDonated >= 500000) {
      return TierLevel.SILVER;
    }

    return TierLevel.BRONZE;
  }
}
