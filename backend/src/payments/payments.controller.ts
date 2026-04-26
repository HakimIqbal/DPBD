import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  BadRequestException,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { PaymentsService } from './payments.service';
import type { MidtransTransaction } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  /**
   * Create payment transaction (Protected - requires JWT)
   * POST /payments/create
   */
  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
    @Request() req: { user: { sub: string } },
  ): Promise<{
    token: string;
    snapUrl: string;
    orderId: string;
    donationId: string;
    amount: number;
    program: { id: string; title: string };
  }> {
    const userId = req.user.sub;
    if (!userId) {
      throw new BadRequestException('User ID not found in token');
    }
    return await this.paymentsService.createPayment(createPaymentDto, userId);
  }

  /**
   * Handle Midtrans webhook notification (Public - no auth required)
   * POST /payments/webhook/midtrans
   */
  @Post('webhook/midtrans')
  @HttpCode(200)
  async webhookMidtrans(
    @Body() notification: MidtransTransaction,
  ): Promise<{ status: string; orderId: string; transactionStatus: string }> {
    return await this.paymentsService.handleWebhook(notification);
  }

  /**
   * Get transaction status by order ID
   * GET /payments/status/:orderId
   */
  @Get('status/:orderId')
  async getStatus(@Param('orderId') orderId: string) {
    return await this.paymentsService.getTransactionStatus(orderId);
  }

  /**
   * Get donation with transaction details (Protected)
   * GET /payments/donation/:donationId
   */
  @Get('donation/:donationId')
  @UseGuards(JwtAuthGuard)
  async getDonation(@Param('donationId') donationId: string) {
    return await this.paymentsService.getDonationWithTransaction(donationId);
  }

  /**
   * Download payment receipt PDF (Protected)
   * GET /payments/:donationId/receipt
   */
  @Get(':donationId/receipt')
  async getReceipt(
    @Param('donationId') donationId: string,
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.paymentsService.generateReceipt(donationId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="receipt-${donationId}.pdf"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  /**
   * Request refund for a donation (Protected - requires JWT)
   * POST /payments/:donationId/refund
   */
  @Post(':donationId/refund')
  @UseGuards(JwtAuthGuard)
  async requestRefund(
    @Param('donationId') donationId: string,
    @Body() refundPaymentDto: RefundPaymentDto,
  ): Promise<{ status: string; refundId: string; message: string }> {
    return await this.paymentsService.requestRefund({
      donationId,
      amount: refundPaymentDto.amount,
      reason: refundPaymentDto.reason,
    });
  }

  /**
   * Get refund status for a donation (Protected - requires JWT)
   * GET /payments/:donationId/refund-status
   */
  @Get(':donationId/refund-status')
  @UseGuards(JwtAuthGuard)
  async getRefundStatus(@Param('donationId') donationId: string): Promise<{
    donationId: string;
    totalAmount: number;
    refundedAmount: number;
    status: string;
    refundedAt: Date | null;
    reason: string | null;
  }> {
    return await this.paymentsService.getRefundStatus(donationId);
  }
}
