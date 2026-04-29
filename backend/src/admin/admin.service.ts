import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Donation } from '../entities/donation.entity';
import { Program } from '../entities/program.entity';
import { User } from '../entities/user.entity';
import { EmailService } from '../email/email.service';
import { AuditService } from '../audit/audit.service';
import type { AuditActor } from '../audit/audit-actor.util';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';

export interface BulkActionResult {
  success: number;
  failed: number;
  total: number;
  failedIds: string[];
  message: string;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Donation)
    private donationRepository: Repository<Donation>,
    @InjectRepository(Program)
    private programRepository: Repository<Program>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private emailService: EmailService,
    private auditService: AuditService,
  ) {}

  /**
   * Create an organizational user (admin/editor/finance/ceo/cfo/...) with a
   * pre-set password. Donor roles (`personal`, `company`) are rejected — they
   * must self-register via the public /auth/register endpoint.
   *
   * Returns the created user with the password hash stripped.
   *
   * @param actor - Caller identity for the audit trail. Optional so the
   *   method can still be called from a script context (e.g. seed) without
   *   a request — audit log will record `null` actor in that case.
   */
  async createUser(
    dto: CreateAdminUserDto,
    actor?: AuditActor,
  ): Promise<Omit<User, 'password'>> {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.userRepository.create({
      email: dto.email,
      name: dto.name,
      role: dto.role,
      password: hashedPassword,
      isActive: true,
      status: 'active',
    });

    const saved = await this.userRepository.save(user);

    // Audit AFTER the save so we never log a creation that didn't happen.
    // AuditService swallows its own errors, so this can never break the
    // user-creation flow — the password hash is intentionally not in the
    // metadata, only the email and resulting role.
    await this.auditService.log({
      ...(actor ?? {}),
      action: 'USER_CREATED',
      entityType: 'User',
      entityId: saved.id,
      metadata: { email: dto.email, role: dto.role },
    });

    // Strip the password hash from the response — never expose it, even
    // to admins. Same pattern used by AuthService.generateAuthResponse.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...safeUser } = saved;
    return safeUser;
  }

  /**
   * Bulk approve donations
   */
  async bulkApproveDonations(donationIds: string[]): Promise<BulkActionResult> {
    if (!donationIds || donationIds.length === 0) {
      throw new BadRequestException('No donation IDs provided');
    }

    let success = 0;
    let failed = 0;
    const failedIds: string[] = [];

    for (const donationId of donationIds) {
      try {
        const donation = await this.donationRepository.findOne({
          where: { id: donationId },
          relations: ['program', 'user'],
        });

        if (!donation) {
          failedIds.push(donationId);
          failed++;
          continue;
        }

        if (donation.status !== 'pending') {
          failedIds.push(donationId);
          failed++;
          continue;
        }

        // Update donation status to completed
        donation.status = 'completed';
        donation.completedAt = new Date();
        donation.nextReminderAt = null;
        donation.reminderSent = true;

        await this.donationRepository.save(donation);

        // Update program metrics
        const program = donation.program;
        if (program) {
          program.collectedAmount =
            (program.collectedAmount ?? 0) + donation.amount;
          program.donorCount = (program.donorCount ?? 0) + 1;
          await this.programRepository.save(program);
        }

        success++;
      } catch {
        failedIds.push(donationId);
        failed++;
      }
    }

    return {
      success,
      failed,
      total: donationIds.length,
      failedIds,
      message: `${success} donations approved, ${failed} failed`,
    };
  }

  /**
   * Bulk reject donations
   */
  async bulkRejectDonations(
    donationIds: string[],
    reason?: string,
  ): Promise<BulkActionResult> {
    if (!donationIds || donationIds.length === 0) {
      throw new BadRequestException('No donation IDs provided');
    }

    let success = 0;
    let failed = 0;
    const failedIds: string[] = [];

    for (const donationId of donationIds) {
      try {
        const donation = await this.donationRepository.findOne({
          where: { id: donationId },
          relations: ['program', 'user'],
        });

        if (!donation) {
          failedIds.push(donationId);
          failed++;
          continue;
        }

        if (donation.status !== 'pending') {
          failedIds.push(donationId);
          failed++;
          continue;
        }

        // Update donation status to failed
        donation.status = 'failed';
        donation.failureReason = reason || 'Rejected by admin';

        await this.donationRepository.save(donation);

        // Send rejection email
        if (!donation.isAnonymous && donation.user && donation.user.email) {
          try {
            await this.emailService.sendPaymentReminder({
              donorName: donation.user.name || 'Donor',
              donorEmail: donation.user.email,
              programTitle: donation.program?.title || 'Program',
              amount: donation.amount,
              orderId: donation.externalId,
              expiryTime: new Date(),
              paymentLink: '',
            });
          } catch {
            // Log but don't fail the operation
          }
        }

        success++;
      } catch {
        failedIds.push(donationId);
        failed++;
      }
    }

    return {
      success,
      failed,
      total: donationIds.length,
      failedIds,
      message: `${success} donations rejected, ${failed} failed`,
    };
  }

  /**
   * Bulk refund donations
   */
  async bulkRefundDonations(
    donationIds: string[],
    reason?: string,
  ): Promise<BulkActionResult> {
    if (!donationIds || donationIds.length === 0) {
      throw new BadRequestException('No donation IDs provided');
    }

    let success = 0;
    let failed = 0;
    const failedIds: string[] = [];

    for (const donationId of donationIds) {
      try {
        const donation = await this.donationRepository.findOne({
          where: { id: donationId },
          relations: ['program', 'user'],
        });

        if (!donation) {
          failedIds.push(donationId);
          failed++;
          continue;
        }

        if (donation.status !== 'completed') {
          failedIds.push(donationId);
          failed++;
          continue;
        }

        // Update donation status to refunded
        donation.status = 'refunded';
        donation.refundedAmount = donation.amount;
        donation.refundReason = reason || 'Refunded by admin';
        donation.refundedAt = new Date();

        await this.donationRepository.save(donation);

        // Reverse program metrics
        const program = donation.program;
        if (program) {
          program.collectedAmount = Math.max(
            0,
            (program.collectedAmount ?? 0) - donation.amount,
          );
          program.donorCount = Math.max(0, (program.donorCount ?? 0) - 1);
          await this.programRepository.save(program);
        }

        // Send refund notification
        if (!donation.isAnonymous && donation.user && donation.user.email) {
          try {
            await this.emailService.sendRefundNotification({
              donorName: donation.user.name || 'Donor',
              donorEmail: donation.user.email,
              programTitle: donation.program?.title || 'Program',
              amount: donation.amount,
              orderId: donation.externalId,
              transactionId: donation.externalId,
              reason: reason || 'Refunded by admin',
              refundReference: `BULK-REFUND-${Date.now()}`,
            });
          } catch {
            // Log but don't fail the operation
          }
        }

        success++;
      } catch {
        failedIds.push(donationId);
        failed++;
      }
    }

    return {
      success,
      failed,
      total: donationIds.length,
      failedIds,
      message: `${success} donations refunded, ${failed} failed`,
    };
  }

  /**
   * Bulk update donation status
   */
  async bulkUpdateStatus(
    donationIds: string[],
    status: 'pending' | 'completed' | 'failed' | 'refunded',
  ): Promise<BulkActionResult> {
    if (!donationIds || donationIds.length === 0) {
      throw new BadRequestException('No donation IDs provided');
    }

    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }

    let success = 0;
    let failed = 0;
    const failedIds: string[] = [];

    for (const donationId of donationIds) {
      try {
        const donation = await this.donationRepository.findOne({
          where: { id: donationId },
          relations: ['program', 'user'],
        });

        if (!donation) {
          failedIds.push(donationId);
          failed++;
          continue;
        }

        const previousStatus = donation.status;
        donation.status = status;

        // Handle status-specific logic
        if (status === 'completed' && previousStatus !== 'completed') {
          donation.completedAt = new Date();

          // Update program metrics
          const program = donation.program;
          if (program) {
            program.collectedAmount =
              (program.collectedAmount ?? 0) + donation.amount;
            program.donorCount = (program.donorCount ?? 0) + 1;
            await this.programRepository.save(program);
          }
        } else if (status === 'refunded' && previousStatus === 'completed') {
          donation.refundedAmount = donation.amount;
          donation.refundedAt = new Date();

          // Reverse program metrics
          const program = donation.program;
          if (program) {
            program.collectedAmount = Math.max(
              0,
              (program.collectedAmount ?? 0) - donation.amount,
            );
            program.donorCount = Math.max(0, (program.donorCount ?? 0) - 1);
            await this.programRepository.save(program);
          }
        }

        await this.donationRepository.save(donation);
        success++;
      } catch {
        failedIds.push(donationId);
        failed++;
      }
    }

    return {
      success,
      failed,
      total: donationIds.length,
      failedIds,
      message: `${success} donations updated to ${status}, ${failed} failed`,
    };
  }

  /**
   * Get bulk action summary
   */
  async getBulkActionSummary(): Promise<{
    totalDonations: number;
    pendingCount: number;
    completedCount: number;
    failedCount: number;
    refundedCount: number;
  }> {
    const donations = await this.donationRepository.find();

    return {
      totalDonations: donations.length,
      pendingCount: donations.filter((d) => d.status === 'pending').length,
      completedCount: donations.filter((d) => d.status === 'completed').length,
      failedCount: donations.filter((d) => d.status === 'failed').length,
      refundedCount: donations.filter((d) => d.status === 'refunded').length,
    };
  }
}
