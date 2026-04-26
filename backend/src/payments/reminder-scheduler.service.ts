import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import * as schedule from 'node-schedule';
import { Donation } from '../entities/donation.entity';
import { Program } from '../entities/program.entity';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ReminderSchedulerService {
  private readonly logger = new Logger(ReminderSchedulerService.name);
  private job: schedule.Job | null = null;

  // Send reminder 12 hours after donation creation if still pending
  private readonly REMINDER_DELAY_HOURS = 12;

  constructor(
    @InjectRepository(Donation)
    private donationRepository: Repository<Donation>,
    @InjectRepository(Program)
    private programRepository: Repository<Program>,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  /**
   * Initialize the reminder scheduler
   * Runs every hour to check for pending donations that need reminders
   */
  onModuleInit(): void {
    this.startScheduler();
  }

  /**
   * Clean up scheduler on module destroy
   */
  onModuleDestroy(): void {
    this.stopScheduler();
  }

  /**
   * Start the scheduler - runs every hour
   */
  private startScheduler(): void {
    // Run every hour at minute 0
    this.job = schedule.scheduleJob('0 * * * *', async () => {
      await this.processPaymentReminders();
    });

    this.logger.log('Payment reminder scheduler started (runs every hour)');
  }

  /**
   * Stop the scheduler
   */
  private stopScheduler(): void {
    if (this.job) {
      this.job.cancel();
      this.logger.log('Payment reminder scheduler stopped');
    }
  }

  /**
   * Process and send payment reminders
   */
  private async processPaymentReminders(): Promise<void> {
    try {
      const now = new Date();

      // Find pending donations that need reminders
      // 1. nextReminderAt is in the past (reminder should be sent)
      // 2. or nextReminderAt is null and donation is old enough (12 hours)
      const pendingDonations = await this.donationRepository.find({
        where: [
          {
            status: 'pending',
            nextReminderAt: LessThanOrEqual(now),
            reminderSent: false,
          },
        ],
        relations: ['user', 'program'],
      });

      // Also find pending donations that haven't had nextReminderAt set yet
      const oldPendingDonations = await this.donationRepository
        .createQueryBuilder('donation')
        .leftJoinAndSelect('donation.user', 'user')
        .leftJoinAndSelect('donation.program', 'program')
        .where('donation.status = :status', { status: 'pending' })
        .andWhere('donation.nextReminderAt IS NULL')
        .andWhere('donation.reminderSent = :reminderSent', {
          reminderSent: false,
        })
        .andWhere(
          `donation.createdAt <= datetime('now', '-${this.REMINDER_DELAY_HOURS} hours')`,
        )
        .getMany();

      const allPendingDonations = [...pendingDonations, ...oldPendingDonations];
      const uniqueDonations = Array.from(
        new Map(allPendingDonations.map((d) => [d.id, d])).values(),
      );

      if (uniqueDonations.length === 0) {
        this.logger.debug('No pending donations found for reminders');
        return;
      }

      this.logger.log(
        `Processing ${uniqueDonations.length} donations for reminders`,
      );

      for (const donation of uniqueDonations) {
        await this.sendPaymentReminder(donation);
      }
    } catch (error) {
      this.logger.error(
        `Error processing payment reminders: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Send reminder email for a specific donation
   */
  private async sendPaymentReminder(donation: Donation): Promise<void> {
    try {
      // Skip anonymous donors
      if (donation.isAnonymous || !donation.user || !donation.user.email) {
        donation.reminderSent = true;
        await this.donationRepository.save(donation);
        return;
      }

      // Calculate expiry time (24 hours from creation)
      const expiryTime = new Date(donation.createdAt);
      expiryTime.setHours(expiryTime.getHours() + 24);

      // If already expired, don't send reminder
      if (expiryTime < new Date()) {
        donation.reminderSent = true;
        await this.donationRepository.save(donation);
        return;
      }

      // Construct payment link
      const paymentLink = `${this.configService.get<string>('FRONTEND_URL')}/donate/instruction?order_id=${donation.externalId}`;

      // Send reminder email
      await this.emailService.sendPaymentReminder({
        donorName: donation.user.name || 'Donor',
        donorEmail: donation.user.email,
        programTitle: donation.program?.title || 'Program',
        amount: donation.amount,
        orderId: donation.externalId,
        expiryTime,
        paymentLink,
      });

      // Update reminder tracking
      donation.reminderSent = true;
      donation.nextReminderAt = new Date(
        new Date().getTime() + 24 * 60 * 60 * 1000,
      ); // Next reminder in 24 hours if still pending

      await this.donationRepository.save(donation);

      this.logger.log(
        `Reminder sent for donation ${donation.id} to ${donation.user.email}`,
      );
    } catch (error) {
      this.logger.error(
        `Error sending reminder for donation ${donation.id}: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Reset reminder for a donation (used when donation is recreated, etc.)
   */
  async resetReminder(donationId: string): Promise<void> {
    const donation = await this.donationRepository.findOne({
      where: { id: donationId },
    });

    if (donation) {
      const reminderTime = new Date();
      reminderTime.setHours(
        reminderTime.getHours() + this.REMINDER_DELAY_HOURS,
      );

      donation.nextReminderAt = reminderTime;
      donation.reminderSent = false;

      await this.donationRepository.save(donation);
    }
  }
}
