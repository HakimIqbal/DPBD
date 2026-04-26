import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

export interface ReceiptData {
  donorName: string;
  programTitle: string;
  amount: number;
  orderId: string;
  transactionId: string;
  paymentMethod: string;
  paymentDate: Date;
  donationId: string;
  programDescription?: string;
  logoUrl?: string;
}

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  private readonly tempDir = path.join(process.cwd(), 'dist', 'temp');

  constructor(private configService: ConfigService) {
    // Ensure temp directory exists
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Generate payment receipt PDF
   */
  async generatePaymentReceipt(data: ReceiptData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 40,
        });

        const chunks: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });

        doc.on('end', () => {
          resolve(Buffer.concat(chunks));
        });

        doc.on('error', (error: unknown) => {
          const err = error instanceof Error ? error : new Error(String(error));
          this.logger.error(`PDF generation error: ${err.message}`);
          reject(err);
        });

        // Draw PDF content
        this.drawHeader(doc);
        this.drawReceiptDetails(doc, data);
        this.drawDonationDetails(doc, data);
        this.drawPaymentDetails(doc, data);
        this.drawFooter(doc);

        doc.end();
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        this.logger.error(`Failed to generate PDF: ${err.message}`);
        reject(err);
      }
    });
  }

  /**
   * Generate and save receipt PDF file
   */
  async saveReceiptFile(
    data: ReceiptData,
  ): Promise<{ filename: string; path: string }> {
    try {
      const buffer = await this.generatePaymentReceipt(data);
      const filename = `receipt-${data.donationId}-${Date.now()}.pdf`;
      const filepath = path.join(this.tempDir, filename);

      fs.writeFileSync(filepath, buffer);

      this.logger.log(`Receipt saved: ${filepath}`);
      return { filename, path: filepath };
    } catch (error) {
      this.logger.error(
        `Failed to save receipt file: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  /**
   * Draw PDF header with organization name
   */
  private drawHeader(doc: InstanceType<typeof PDFDocument>): void {
    const orgName = 'DPBD - Dana Pemberdayaan Bisnis Donasi';

    doc.fontSize(18).font('Helvetica-Bold').text(orgName, { align: 'center' });

    doc
      .fontSize(10)
      .font('Helvetica')
      .text('Donation Receipt', { align: 'center' });

    doc
      .moveTo(40, doc.y + 10)
      .lineTo(555, doc.y + 10)
      .stroke();
    doc.moveDown(15);
  }

  /**
   * Draw receipt header details
   */
  private drawReceiptDetails(
    doc: InstanceType<typeof PDFDocument>,
    data: ReceiptData,
  ): void {
    const rightX = 300;

    // Left column
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Receipt Number:', { continued: true })
      .font('Helvetica')
      .text(` ${data.orderId}`);

    doc
      .font('Helvetica-Bold')
      .text('Donation ID:', { continued: true })
      .font('Helvetica')
      .text(` ${data.donationId}`);

    // Right column
    const dateStr = new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(data.paymentDate);

    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Date:', rightX, doc.y - 20, { continued: true })
      .font('Helvetica')
      .text(` ${dateStr}`);

    doc
      .font('Helvetica-Bold')
      .text('Status:', { continued: true })
      .font('Helvetica')
      .text(': Payment Completed');

    doc.moveDown(15);
  }

  /**
   * Draw donor and donation details
   */
  private drawDonationDetails(
    doc: InstanceType<typeof PDFDocument>,
    data: ReceiptData,
  ): void {
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('Donor Information', { underline: true });

    doc.moveDown(8);

    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Name:', { continued: true })
      .font('Helvetica')
      .text(` ${data.donorName}`);

    doc.moveDown(12);

    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('Donation Details', { underline: true });

    doc.moveDown(8);

    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Program:', { continued: true })
      .font('Helvetica')
      .text(` ${data.programTitle}`);

    if (data.programDescription) {
      doc
        .fontSize(9)
        .font('Helvetica')
        .text(data.programDescription, { align: 'justify' });
    }

    doc.moveDown(8);

    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Donation Amount:', { continued: true })
      .font('Helvetica');

    const formattedAmount = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(data.amount);

    doc.text(` ${formattedAmount}`);

    doc.moveDown(15);
  }

  /**
   * Draw payment method details
   */
  private drawPaymentDetails(
    doc: InstanceType<typeof PDFDocument>,
    data: ReceiptData,
  ): void {
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('Payment Information', { underline: true });

    doc.moveDown(8);

    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Payment Method:', { continued: true })
      .font('Helvetica')
      .text(` ${this.formatPaymentMethod(data.paymentMethod)}`);

    doc
      .font('Helvetica-Bold')
      .text('Transaction ID:', { continued: true })
      .font('Helvetica')
      .text(` ${data.transactionId}`);

    doc.moveDown(15);

    // Important note
    doc
      .fontSize(9)
      .font('Helvetica-Oblique')
      .fillColor('#FF9800')
      .text(
        'This is an official receipt for your donation. Please keep this receipt for your records.',
        { align: 'justify' },
      );

    doc.fillColor('black');
  }

  /**
   * Draw PDF footer
   */
  private drawFooter(doc: InstanceType<typeof PDFDocument>): void {
    const pageHeight = doc.page.height;

    doc
      .moveTo(40, pageHeight - 80)
      .lineTo(555, pageHeight - 80)
      .stroke();

    doc
      .fontSize(8)
      .font('Helvetica')
      .text('DPBD - Donation Platform', 40, pageHeight - 70, {
        align: 'center',
      });

    doc.text('Thank you for your generous donation!', {
      align: 'center',
    });

    doc.text(
      'Your support makes a real difference in creating lasting positive change.',
      {
        align: 'center',
      },
    );

    doc.text(`Generated on ${new Date().toLocaleString('id-ID')}`, {
      align: 'center',
    });
    doc.fillColor('#999999');
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

  /**
   * Delete temporary PDF file
   */
  deleteFile(filepath: string): void {
    try {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        this.logger.log(`Deleted: ${filepath}`);
      }
    } catch (error) {
      this.logger.warn(
        `Failed to delete file ${filepath}: ${(error as Error).message}`,
      );
    }
  }
}
