import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donation, DonationStatus } from '../entities';
import {
  CreateDonationDto,
  UpdateDonationDto,
} from './dto/create-donation.dto';

@Injectable()
export class DonationsService {
  constructor(
    @InjectRepository(Donation)
    private donationsRepository: Repository<Donation>,
  ) {}

  async create(createDonationDto: CreateDonationDto): Promise<Donation> {
    if (createDonationDto.amount <= 0) {
      throw new BadRequestException('Donation amount must be greater than 0');
    }

    const donation = this.donationsRepository.create({
      ...createDonationDto,
      status: 'pending',
    });

    return this.donationsRepository.save(donation);
  }

  async findAll(filters?: {
    status?: string;
    userId?: string;
    programId?: string;
  }): Promise<Donation[]> {
    const query = this.donationsRepository.createQueryBuilder('donation');

    if (filters?.status) {
      query.where('donation.status = :status', { status: filters.status });
    }

    if (filters?.userId) {
      query.andWhere('donation.userId = :userId', { userId: filters.userId });
    }

    if (filters?.programId) {
      query.andWhere('donation.programId = :programId', {
        programId: filters.programId,
      });
    }

    return query.orderBy('donation.createdAt', 'DESC').getMany();
  }

  async findById(id: string): Promise<Donation> {
    const donation = await this.donationsRepository.findOne({ where: { id } });
    if (!donation) {
      throw new NotFoundException(`Donation with ID ${id} not found`);
    }
    return donation;
  }

  async update(
    id: string,
    updateDonationDto: UpdateDonationDto,
  ): Promise<Donation> {
    const donation = await this.findById(id);
    Object.assign(donation, updateDonationDto);
    return this.donationsRepository.save(donation);
  }

  async updateStatus(id: string, status: string): Promise<Donation> {
    const donation = await this.findById(id);
    donation.status = status as DonationStatus;

    if (status === 'completed') {
      donation.completedAt = new Date();
    }

    return this.donationsRepository.save(donation);
  }

  async delete(id: string): Promise<void> {
    const donation = await this.findById(id);
    await this.donationsRepository.remove(donation);
  }

  async getDonationStats(programId: string): Promise<{
    totalDonations: number;
    totalAmount: number;
    donorCount: number;
    averageDonation: number;
  }> {
    const donations = await this.donationsRepository.find({
      where: { programId, status: 'completed' },
    });

    const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
    const donorCount = new Set(donations.map((d) => d.userId)).size;

    return {
      totalDonations: donations.length,
      totalAmount,
      donorCount,
      averageDonation:
        donations.length > 0 ? totalAmount / donations.length : 0,
    };
  }
}
