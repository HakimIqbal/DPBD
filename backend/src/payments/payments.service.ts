import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as midtransClient from 'midtrans-client';
import { Donation } from '../entities/donation.entity';
import { Program } from '../entities/program.entity';
import { User } from '../entities/user.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { EmailService } from '../email/email.service';
import { PdfService } from '../pdf/pdf.service';

export interface MidtransTransaction {
  transaction_id: string;
  order_id: string;
  merchant_id: string;
  payment_type: string;
  offer_id?: string;
  status_code: string;
  transaction_status: string;
  signature_key: string;
  settlement_time?: string;
  transaction_time: string;
  transaction_amount: number;
}

@Injectable()
export class PaymentsService {
  private snap: midtransClient.Snap;
  private core: midtransClient.CoreApi;

  constructor(
    private configService: ConfigService,
    private emailService: EmailService,
    private pdfService: PdfService,
    @InjectRepository(Donation)
    private donationRepository: Repository<Donation>,
    @InjectRepository(Program)
    private programRepository: Repository<Program>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    const serverKey = this.configService.get<string>('MIDTRANS_SERVER_KEY');
    const clientKey = this.configService.get<string>('MIDTRANS_CLIENT_KEY');
    const isProduction =
      this.configService.get<string>('MIDTRANS_ENVIRONMENT') === 'production';

    this.snap = new midtransClient.Snap({
      isProduction,
      serverKey,
      clientKey,
    });

    this.core = new midtransClient.CoreApi({
      isProduction,
      serverKey,
      clientKey,
    });
  }

  /**
   * Create payment transaction in Midtrans
   */
  async createPayment(
    createPaymentDto: CreatePaymentDto,
    userId: string,
  ): Promise<{
    token: string;
    snapUrl: string;
    orderId: string;
    donationId: string;
    amount: number;
    program: { id: string; title: string };
  }> {
    const {
      programId,
      amount,
      paymentMethod,
      isAnonymous: isAnonValue,
      donorName,
      donorEmail,
    } = createPaymentDto as unknown as {
      programId: string;
      amount: number;
      paymentMethod: string;
      isAnonymous?: boolean;
      donorName?: string;
      donorEmail?: string;
    };

    const isAnonymous = isAnonValue ?? false;

    // Validate program exists
    const program = await this.programRepository.findOne({
      where: { id: programId },
    });
    if (!program) {
      throw new BadRequestException('Program not found');
    }

    // Validate user exists
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Generate order ID
    const orderId = `ORDER-${userId}-${programId}-${Date.now()}`;

    // Midtrans transaction details
    const transactionDetails = {
      order_id: orderId,
      gross_amount: amount,
    };

    // Customer details
    const customerDetails = {
      first_name: isAnonymous ? 'Anonymous' : (donorName ?? user.name),
      email: isAnonymous ? 'anonymous@dpbd.org' : (donorEmail ?? user.email),
      phone: (user.country as string) ?? 'Indonesia',
    };

    // Item details
    const itemDetails = [
      {
        id: programId,
        price: amount,
        quantity: 1,
        name: `Donation to ${program.title}`,
      },
    ];

    // Payment method specific parameters
    let enabledPayments: string[] = [
      'credit_card',
      'gcash',
      'bank_transfer',
      'cimb_clicks',
      'bca_clicks',
      'telkomsel_cash',
    ];

    if (paymentMethod === 'va') {
      enabledPayments = ['bank_transfer'];
    } else if (paymentMethod === 'qris') {
      enabledPayments = ['qris'];
    } else if (paymentMethod === 'ewallet') {
      enabledPayments = ['gopay', 'ovo', 'dana', 'shopeepay'];
    } else if (paymentMethod === 'cc') {
      enabledPayments = ['credit_card'];
    }

    const frontendUrl = (this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000') as string;

    const parameter = {
      transaction_details: transactionDetails,
      customer_details: customerDetails,
      item_details: itemDetails,
      enabled_payments: enabledPayments,
      callbacks: {
        finish: `${frontendUrl}/donate/success?order_id=${orderId}`,
        error: `${frontendUrl}/donate/payment?error=1`,
        pending: `${frontendUrl}/donate/instruction?order_id=${orderId}`,
      },
      expiry: {
        unit: 'hours',
        duration: 24,
      },
    };

    try {
      const transaction = (await this.snap.createTransaction(parameter)) as {
        token: string;
        redirect_url: string;
      };

      // Type guard for paymentMethod
      const isValidPaymentMethod = (
        method: unknown,
      ): method is 'va' | 'qris' | 'ewallet' | 'cc' => {
        const validMethods: readonly ('va' | 'qris' | 'ewallet' | 'cc')[] = [
          'va',
          'qris',
          'ewallet',
          'cc',
        ];
        return validMethods.includes(
          method as 'va' | 'qris' | 'ewallet' | 'cc',
        );
      };

      if (!isValidPaymentMethod(paymentMethod)) {
        throw new BadRequestException('Invalid payment method');
      }

      // Map short payment method to enum value
      const paymentMethodMap = {
        va: 'virtual_account' as const,
        qris: 'qris' as const,
        ewallet: 'bank_transfer' as const,
        cc: 'credit_card' as const,
      };

      const mappedPaymentMethod = paymentMethodMap[paymentMethod];
      const validatedPaymentMethod:
        | 'virtual_account'
        | 'qris'
        | 'credit_card'
        | 'bank_transfer' = mappedPaymentMethod;

      // Create donation record in pending status
      const reminderTime = new Date();
      reminderTime.setHours(reminderTime.getHours() + 12); // Remind after 12 hours

      const donationData = {
        userId: userId as string,
        programId: programId as string,
        amount: amount as number,
        paymentMethod: validatedPaymentMethod,
        isAnonymous: isAnonymous as boolean,
        status: 'pending' as const,
        externalId: orderId as string,
        nextReminderAt: reminderTime as Date,
        reminderSent: false as boolean,
      };

      const donation = this.donationRepository.create(
        donationData as Parameters<typeof this.donationRepository.create>[0],
      );

      await this.donationRepository.save(donation);

      return {
        token: transaction.token,
        snapUrl: transaction.redirect_url,
        orderId,
        donationId: donation.id,
        amount: amount,
        program: {
          id: program.id,
          title: program.title,
        },
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(
        `Failed to create payment: ${errorMessage}`,
      );
    }
  }

  /**
   * Handle Midtrans webhook notification
   */
  async handleWebhook(notification: MidtransTransaction) {
    const { order_id, transaction_status, transaction_id } = notification;

    try {
      // Find donation by order_id
      const donation = await this.donationRepository.findOne({
        where: { externalId: order_id },
        relations: ['program'],
      });

      if (!donation) {
        throw new BadRequestException('Donation not found');
      }

      // Map Midtrans status to donation status
      let donationStatus: 'pending' | 'completed' | 'failed' | 'refunded' =
        'pending';

      if (
        transaction_status === 'settlement' ||
        transaction_status === 'capture'
      ) {
        donationStatus = 'completed';
      } else if (
        transaction_status === 'deny' ||
        transaction_status === 'cancel' ||
        transaction_status === 'expire'
      ) {
        donationStatus = 'failed';
      } else if (transaction_status === 'refund') {
        donationStatus = 'refunded';
      }

      // Update donation status
      donation.status = donationStatus as 'pending' | 'completed' | 'failed' | 'refunded';
      donation.externalId = transaction_id as string;

      if (donationStatus === 'completed') {
        donation.completedAt = new Date() as Date;

        // Clear reminder fields since payment is complete
        donation.nextReminderAt = null as unknown as Date | null;
        donation.reminderSent = true as boolean;

        // Update program collected amount
        const program = donation.program;
        if (program) {
          program.collectedAmount =
            (program.collectedAmount ?? 0) + donation.amount;
          program.donorCount = (program.donorCount ?? 0) + 1;
          await this.programRepository.save(program);
        }

        // Generate PDF receipt
        let receiptUrl: string | undefined;
        try {
          await this.pdfService.generatePaymentReceipt({
            donorName: donation.isAnonymous
              ? 'Anonymous Donor'
              : donation.user?.name || 'Donor',
            programTitle: program?.title || 'Program',
            amount: donation.amount,
            orderId: donation.externalId,
            transactionId: transaction_id,
            paymentMethod: donation.paymentMethod,
            paymentDate: new Date(),
            donationId: donation.id,
            programDescription: program?.description,
          });

          // In production, you would upload this to cloud storage (S3, GCS, etc.)
          // For now, we'll generate it on-demand in the frontend
          receiptUrl = `${this.configService.get<string>('FRONTEND_URL')}/api/donations/${donation.id}/receipt`;
        } catch {
          // Log but don't fail the payment process
        }

        // Send payment confirmation email
        const donorEmail = donation.isAnonymous
          ? 'anonymous@dpbd.org'
          : donation.user?.email || '';

        if (donorEmail && donorEmail !== 'anonymous@dpbd.org') {
          await this.emailService.sendPaymentConfirmation({
            donorName: donation.isAnonymous
              ? 'Valued Donor'
              : donation.user?.name || 'Donor',
            donorEmail,
            programTitle: program?.title || 'Program',
            amount: donation.amount,
            orderId: donation.externalId,
            transactionId: transaction_id,
            paymentMethod: donation.paymentMethod,
            paymentDate: new Date(),
            receiptUrl,
          });
        }
      }

      await this.donationRepository.save(donation);

      return {
        status: 'success',
        orderId: order_id,
        transactionStatus: donationStatus,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to process webhook: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Get transaction status from Midtrans
   */
  async getTransactionStatus(
    orderId: string,
  ): Promise<Record<string, unknown>> {
    try {
      const status = (await this.core.transaction.status(orderId)) as Record<
        string,
        unknown
      >;
      return status;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to get transaction status: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Get donation with transaction details
   */
  async getDonationWithTransaction(
    donationId: string,
  ): Promise<{ donation: unknown; midtransStatus: unknown }> {
    const donation = await this.donationRepository.findOne({
      where: { id: donationId },
      relations: ['user', 'program'],
    });

    if (!donation) {
      throw new BadRequestException('Donation not found');
    }

    // Get Midtrans transaction status
    let midtransStatus: Record<string, unknown> | null = null;
    if (donation.externalId) {
      try {
        midtransStatus = await this.getTransactionStatus(donation.externalId);
      } catch {
        // Silently fail if we can't get status
      }
    }

    return {
      donation,
      midtransStatus,
    };
  }

  /**
   * Generate and return payment receipt PDF
   */
  async generateReceipt(donationId: string): Promise<Buffer> {
    const donation = await this.donationRepository.findOne({
      where: { id: donationId },
      relations: ['user', 'program'],
    });

    if (!donation) {
      throw new BadRequestException('Donation not found');
    }

    if (donation.status !== 'completed') {
      throw new BadRequestException(
        'Receipt only available for completed donations',
      );
    }

    const receiptBuffer = await this.pdfService.generatePaymentReceipt({
      donorName: donation.isAnonymous
        ? 'Anonymous Donor'
        : donation.user?.name || 'Donor',
      programTitle: donation.program?.title || 'Program',
      amount: donation.amount,
      orderId: donation.externalId,
      transactionId: donation.externalId,
      paymentMethod: donation.paymentMethod,
      paymentDate: donation.completedAt || new Date(),
      donationId: donation.id,
      programDescription: donation.program?.description,
    });

    return receiptBuffer;
  }

  /**
   * Request refund for a donation
   */
  async requestRefund(dto: {
    donationId: string;
    amount?: number;
    reason?: string;
  }): Promise<{
    status: string;
    refundId: string;
    message: string;
  }> {
    const { donationId, amount: refundAmount, reason } = dto;

    const donation = await this.donationRepository.findOne({
      where: { id: donationId },
      relations: ['program', 'user'],
    });

    if (!donation) {
      throw new BadRequestException('Donation not found');
    }

    // Validate refund eligibility
    if (donation.status !== 'completed') {
      throw new BadRequestException(
        `Cannot refund donation with status: ${donation.status}`,
      );
    }

    // Use full amount if not specified
    const finalRefundAmount = refundAmount || donation.amount;

    // Validate refund amount
    if (finalRefundAmount <= 0 || finalRefundAmount > donation.amount) {
      throw new BadRequestException(
        `Invalid refund amount. Must be between 1 and ${donation.amount}`,
      );
    }

    try {
      // Call Midtrans refund API via server_key authentication
      const refundKey = `REFUND-${donationId}-${Date.now()}`;
      await (
        this.core.transaction as unknown as {
          refund: (
            transactionId: string,
            params: Record<string, unknown>,
          ) => Promise<unknown>;
        }
      ).refund(donation.externalId, {
        refund_key: refundKey,
        amount: finalRefundAmount,
      });

      // Update donation status
      if (finalRefundAmount === donation.amount) {
        donation.status = 'refunded';
      }

      donation.refundedAmount =
        (donation.refundedAmount || 0) + finalRefundAmount;
      donation.refundReason = reason ?? null;
      donation.refundedAt = new Date();

      await this.donationRepository.save(donation);

      // Update program collected amount if fully refunded
      if (finalRefundAmount === donation.amount && donation.program) {
        const program = donation.program;
        program.collectedAmount = Math.max(
          0,
          (program.collectedAmount ?? 0) - donation.amount,
        );
        program.donorCount = Math.max(0, (program.donorCount ?? 0) - 1);
        await this.programRepository.save(program);
      }

      // Send refund notification email
      if (!donation.isAnonymous && donation.user && donation.user.email) {
        await this.emailService.sendRefundNotification({
          donorName: donation.user.name || 'Donor',
          donorEmail: donation.user.email,
          programTitle: donation.program?.title || 'Program',
          amount: finalRefundAmount,
          orderId: donation.externalId,
          transactionId: donation.externalId,
          reason: reason || undefined,
          refundReference: refundKey,
        });
      }

      return {
        status: 'success',
        refundId: donation.id,
        message: `Refund of IDR ${finalRefundAmount} has been processed`,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to process refund: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Check refund status
   */
  async getRefundStatus(donationId: string): Promise<{
    donationId: string;
    totalAmount: number;
    refundedAmount: number;
    status: string;
    refundedAt: Date | null;
    reason: string | null;
  }> {
    const donation = await this.donationRepository.findOne({
      where: { id: donationId },
    });

    if (!donation) {
      throw new BadRequestException('Donation not found');
    }

    if (!donation.refundedAt) {
      throw new BadRequestException('No refund found for this donation');
    }

    return {
      donationId,
      totalAmount: donation.amount,
      refundedAmount: donation.refundedAmount || 0,
      status: donation.status,
      refundedAt: donation.refundedAt,
      reason: donation.refundReason || null,
    };
  }
}
