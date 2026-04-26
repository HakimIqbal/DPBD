import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface PaymentConfirmationData {
  donorName: string;
  donorEmail: string;
  programTitle: string;
  amount: number;
  orderId: string;
  transactionId: string;
  paymentMethod: string;
  paymentDate: Date;
  receiptUrl?: string;
}

export interface PaymentReminderData {
  donorName: string;
  donorEmail: string;
  programTitle: string;
  amount: number;
  orderId: string;
  expiryTime: Date;
  paymentLink: string;
}

export interface RefundNotificationData {
  donorName: string;
  donorEmail: string;
  programTitle: string;
  amount: number;
  orderId: string;
  transactionId: string;
  reason?: string;
  refundReference?: string;
}

@Injectable()
export class EmailService {
  private transporter: Transporter;
  private readonly logger = new Logger(EmailService.name);
  private isProduction = false;

  constructor(private configService: ConfigService) {
    const emailHost = this.configService.get<string>('EMAIL_HOST');
    const emailPort = this.configService.get<number>('EMAIL_PORT');
    const emailUser = this.configService.get<string>('EMAIL_USER');
    const emailPassword = this.configService.get<string>('EMAIL_PASSWORD');
    const nodeEnv = this.configService.get<string>('NODE_ENV');

    this.isProduction = nodeEnv === 'production';

    // Production: require complete email configuration
    if (this.isProduction && (!emailHost || !emailPort || !emailUser || !emailPassword)) {
      this.logger.error(
        'Email configuration incomplete for production. Please set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, and EMAIL_PASSWORD environment variables.',
      );
      throw new Error(
        'Email service requires complete configuration in production (EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD)',
      );
    }

    // Development: use test transporter if no configuration provided
    if (!emailHost || !emailPort || !emailUser || !emailPassword) {
      this.logger.warn(
        'Email configuration not found. Using development mode - emails will be logged instead of sent.',
      );
      this.transporter = nodemailer.createTransport({
        host: 'localhost',
        port: 1025, // MailHog default port (or just a dummy port)
        debug: true,
        logger: true,
      });
    } else {
      this.transporter = nodemailer.createTransport({
        host: emailHost,
        port: emailPort,
        secure: emailPort === 465,
        auth: {
          user: emailUser,
          pass: emailPassword,
        },
      });
      this.logger.log(`Email service initialized with host: ${emailHost}:${emailPort}`);
    }
  }

  /**
   * Send payment confirmation email
   */
  async sendPaymentConfirmation(data: PaymentConfirmationData): Promise<void> {
    try {
      const emailFrom =
        this.configService.get<string>('EMAIL_FROM') || 'noreply@dpbd.org';

      const html = this.generatePaymentConfirmationHtml(data);

      await this.transporter.sendMail({
        from: emailFrom,
        to: data.donorEmail,
        subject: `Payment Confirmation - Donation to ${data.programTitle}`,
        html,
      });

      this.logger.log(`Payment confirmation email sent to ${data.donorEmail}`);
    } catch (error) {
      this.logger.error(
        `Failed to send payment confirmation email: ${(error as Error).message}`,
      );
      // Don't throw error - email failure shouldn't block payment process
    }
  }

  /**
   * Send payment reminder email
   */
  async sendPaymentReminder(data: PaymentReminderData): Promise<void> {
    try {
      const emailFrom =
        this.configService.get<string>('EMAIL_FROM') || 'noreply@dpbd.org';

      const html = this.generatePaymentReminderHtml(data);

      await this.transporter.sendMail({
        from: emailFrom,
        to: data.donorEmail,
        subject: `Reminder: Complete Your Donation to ${data.programTitle}`,
        html,
      });

      this.logger.log(`Payment reminder email sent to ${data.donorEmail}`);
    } catch (error) {
      this.logger.error(
        `Failed to send payment reminder email: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Send refund notification email
   */
  async sendRefundNotification(data: RefundNotificationData): Promise<void> {
    try {
      const emailFrom =
        this.configService.get<string>('EMAIL_FROM') || 'noreply@dpbd.org';

      const html = this.generateRefundNotificationHtml(data);

      await this.transporter.sendMail({
        from: emailFrom,
        to: data.donorEmail,
        subject: `Refund Processed - ${data.programTitle}`,
        html,
      });

      this.logger.log(`Refund notification email sent to ${data.donorEmail}`);
    } catch (error) {
      this.logger.error(
        `Failed to send refund notification email: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Generate payment confirmation HTML email
   */
  private generatePaymentConfirmationHtml(
    data: PaymentConfirmationData,
  ): string {
    const formattedAmount = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(data.amount);

    const formattedDate = new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(data.paymentDate);

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; border-radius: 5px; text-align: center; }
            .content { padding: 20px 0; }
            .section { margin: 15px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #4CAF50; }
            .section-title { font-weight: bold; color: #4CAF50; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; }
            .detail-label { font-weight: bold; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Confirmation</h1>
              <p>Thank you for your donation!</p>
            </div>

            <div class="content">
              <p>Dear ${data.donorName},</p>
              <p>We have received your donation. Details are provided below:</p>

              <div class="section">
                <div class="section-title">Donation Details</div>
                <div class="detail-row">
                  <span class="detail-label">Program:</span>
                  <span>${data.programTitle}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Amount:</span>
                  <span>${formattedAmount}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Payment Method:</span>
                  <span>${this.formatPaymentMethod(data.paymentMethod)}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date & Time:</span>
                  <span>${formattedDate}</span>
                </div>
              </div>

              <div class="section">
                <div class="section-title">Transaction Information</div>
                <div class="detail-row">
                  <span class="detail-label">Order ID:</span>
                  <span>${data.orderId}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Transaction ID:</span>
                  <span>${data.transactionId}</span>
                </div>
              </div>

              ${data.receiptUrl ? `<p><a href="${data.receiptUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Download Receipt</a></p>` : ''}

              <p>Your contribution will make a real difference. Thank you for supporting our mission!</p>
            </div>

            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; 2024 DPBD. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate payment reminder HTML email
   */
  private generatePaymentReminderHtml(data: PaymentReminderData): string {
    const formattedAmount = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(data.amount);

    const formattedExpiry = new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(data.expiryTime);

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #FF9800; color: white; padding: 20px; border-radius: 5px; text-align: center; }
            .content { padding: 20px 0; }
            .section { margin: 15px 0; padding: 15px; background-color: #fff3e0; border-left: 4px solid #FF9800; }
            .section-title { font-weight: bold; color: #FF9800; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; }
            .detail-label { font-weight: bold; }
            .cta-button { background-color: #FF9800; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Reminder</h1>
              <p>Complete your donation now</p>
            </div>

            <div class="content">
              <p>Dear ${data.donorName},</p>
              <p>You initiated a donation to <strong>${data.programTitle}</strong> but haven't completed the payment yet.</p>

              <div class="section">
                <div class="section-title">Donation Details</div>
                <div class="detail-row">
                  <span class="detail-label">Program:</span>
                  <span>${data.programTitle}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Amount:</span>
                  <span>${formattedAmount}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Order ID:</span>
                  <span>${data.orderId}</span>
                </div>
              </div>

              <div class="section">
                <p><strong>Note:</strong> This payment link will expire on <strong>${formattedExpiry}</strong>.</p>
              </div>

              <p style="text-align: center;">
                <a href="${data.paymentLink}" class="cta-button">Complete Payment Now</a>
              </p>

              <p>If you have any questions, please don't hesitate to contact us.</p>
            </div>

            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; 2024 DPBD. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate refund notification HTML email
   */
  private generateRefundNotificationHtml(data: RefundNotificationData): string {
    const formattedAmount = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(data.amount);

    const refundedDate = new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date());

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; border-radius: 5px; text-align: center; }
            .content { padding: 20px 0; }
            .section { margin: 15px 0; padding: 15px; background-color: #f1f8f4; border-left: 4px solid #4CAF50; }
            .section-title { font-weight: bold; color: #4CAF50; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0; }
            .detail-row:last-child { border-bottom: none; }
            .detail-label { font-weight: bold; color: #666; }
            .detail-value { text-align: right; }
            .status-badge { background-color: #4CAF50; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-size: 14px; }
            .timeline { margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-radius: 5px; }
            .timeline-item { padding: 10px 0; display: flex; align-items: flex-start; }
            .timeline-dot { width: 16px; height: 16px; background-color: #4CAF50; border-radius: 50%; margin-right: 15px; margin-top: 4px; flex-shrink: 0; }
            .timeline-content { flex: 1; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✓ Refund Processed</h1>
              <p>Your refund has been successfully initiated</p>
            </div>

            <div class="content">
              <p>Dear ${data.donorName},</p>
              <p>We are pleased to confirm that your refund has been processed. Below are the details of your refund:</p>

              <div class="section">
                <div class="section-title">Refund Details</div>
                <div class="detail-row">
                  <span class="detail-label">Program:</span>
                  <span class="detail-value">${data.programTitle}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Refund Amount:</span>
                  <span class="detail-value"><strong>${formattedAmount}</strong></span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Original Transaction ID:</span>
                  <span class="detail-value" style="font-family: monospace; font-size: 12px;">${data.transactionId}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Refund Reference:</span>
                  <span class="detail-value" style="font-family: monospace; font-size: 12px;">${data.refundReference}</span>
                </div>
                ${
                  data.reason
                    ? `
                <div class="detail-row">
                  <span class="detail-label">Reason:</span>
                  <span class="detail-value">${data.reason}</span>
                </div>
                    `
                    : ''
                }
                <div class="detail-row">
                  <span class="detail-label">Status:</span>
                  <span class="detail-value"><span class="status-badge">Processed</span></span>
                </div>
              </div>

              <div class="timeline">
                <div class="timeline-item">
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <strong>Refund Initiated</strong>
                    <p style="color: #999; font-size: 14px; margin: 5px 0 0 0;">${refundedDate}</p>
                  </div>
                </div>
                <div class="timeline-item">
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <strong>Processing</strong>
                    <p style="color: #999; font-size: 14px; margin: 5px 0 0 0;">Your refund is being processed by the payment provider</p>
                  </div>
                </div>
                <div class="timeline-item">
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <strong>Fund Transfer</strong>
                    <p style="color: #999; font-size: 14px; margin: 5px 0 0 0;">Funds will be returned to your original payment method within 3-5 business days</p>
                  </div>
                </div>
              </div>

              <div class="section">
                <p><strong>What This Means:</strong></p>
                <ul>
                  <li>Your refund has been approved and initiated</li>
                  <li>The refund may take 3-5 business days to appear in your account</li>
                  <li>The exact timing depends on your bank or payment provider</li>
                  <li>If you don't see the refund within 5 business days, please contact us</li>
                </ul>
              </div>

              <p style="color: #666;">Thank you for your understanding. If you have any questions regarding this refund or would like to donate again in the future, please don't hesitate to contact us.</p>
            </div>

            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; 2024 DPBD. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Format payment method name
   */
  private formatPaymentMethod(method: string): string {
    const methodMap: Record<string, string> = {
      virtual_account: 'Virtual Account (Bank Transfer)',
      qris: 'QRIS',
      bank_transfer: 'E-Wallet',
      credit_card: 'Credit Card',
    };
    return methodMap[method] || method;
  }
}
