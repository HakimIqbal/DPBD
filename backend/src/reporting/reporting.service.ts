import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';
import { Donation } from '../entities/donation.entity';
import { Program } from '../entities/program.entity';

export interface ReportOptions {
  startDate?: Date;
  endDate?: Date;
  programId?: string;
  status?: string;
}

@Injectable()
export class ReportingService {
  constructor(
    @InjectRepository(Donation)
    private donationRepository: Repository<Donation>,
    @InjectRepository(Program)
    private programRepository: Repository<Program>,
  ) {}

  /**
   * Generate transaction report as PDF
   */
  async generateTransactionReportPDF(
    options: ReportOptions = {},
  ): Promise<Buffer> {
    const donations = await this.getFilledDonations(options);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 40 });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc.fontSize(24).font('Helvetica-Bold').text('Transaction Report', {
          align: 'center',
        });
        doc.moveDown(0.5);
        doc
          .fontSize(11)
          .font('Helvetica')
          .text(
            `Generated on ${new Date().toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}`,
            { align: 'center' },
          );
        doc.moveDown(1);

        // Summary
        const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
        const completed = donations.filter(
          (d) => d.status === 'completed',
        ).length;

        doc.fontSize(12).font('Helvetica-Bold').text('Summary');
        doc.fontSize(11).font('Helvetica');
        doc.text(`Total Transactions: ${donations.length}`);
        doc.text(`Total Amount: IDR ${this.formatCurrency(totalAmount)}`);
        doc.text(`Completed: ${completed}`);
        doc.moveDown(1);

        // Table Header
        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('Date', 50, doc.y, { width: 80 })
          .text('Donor', 130, doc.y - 14, { width: 80 })
          .text('Program', 210, doc.y - 14, { width: 100 })
          .text('Amount', 310, doc.y - 14, { width: 80 })
          .text('Status', 390, doc.y - 14, { width: 70 });

        doc
          .strokeColor('#cccccc')
          .moveTo(50, doc.y)
          .lineTo(550, doc.y)
          .stroke();
        doc.moveDown(0.5);

        // Table Data
        doc.fontSize(9).font('Helvetica');
        donations.slice(0, 40).forEach((donation) => {
          const donorName = donation.isAnonymous
            ? 'Anonymous'
            : donation.user?.name || 'Unknown';

          const y = doc.y;
          doc
            .text(
              new Date(donation.createdAt).toLocaleDateString('id-ID'),
              50,
              y,
              { width: 80 },
            )
            .text(donorName, 130, y, { width: 80 })
            .text(donation.program?.title || 'N/A', 210, y, { width: 100 })
            .text(`IDR ${this.formatCurrency(donation.amount)}`, 310, y, {
              width: 80,
            })
            .text(donation.status, 390, y, { width: 70 });

          doc.moveDown(0.6);
        });

        if (donations.length > 40) {
          doc.fontSize(9).text(`... and ${donations.length - 40} more records`);
        }

        doc.end();
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        reject(err);
      }
    });
  }

  /**
   * Generate transaction report as Excel
   */
  async generateTransactionReportExcel(
    options: ReportOptions = {},
  ): Promise<Buffer> {
    const donations = await this.getFilledDonations(options);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Transactions');

    // Set column widths
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Donor Name', key: 'donorName', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Program', key: 'program', width: 25 },
      { header: 'Amount (IDR)', key: 'amount', width: 18 },
      { header: 'Payment Method', key: 'paymentMethod', width: 18 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Transaction ID', key: 'transactionId', width: 20 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF366092' },
    };

    // Add data rows
    donations.forEach((donation) => {
      const donorName = donation.isAnonymous
        ? 'Anonymous'
        : donation.user?.name || 'Unknown';
      const email = donation.isAnonymous ? '-' : donation.user?.email || '-';

      worksheet.addRow({
        date: new Date(donation.createdAt).toLocaleDateString('id-ID'),
        donorName,
        email,
        program: donation.program?.title || 'N/A',
        amount: donation.amount,
        paymentMethod: this.formatPaymentMethod(donation.paymentMethod),
        status: donation.status,
        transactionId: donation.externalId,
      });
    });

    // Format currency column
    worksheet.getColumn('amount').numFmt = '#,##0';

    // Add summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
    const completed = donations.filter((d) => d.status === 'completed').length;
    const pending = donations.filter((d) => d.status === 'pending').length;
    const failed = donations.filter((d) => d.status === 'failed').length;

    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 25 },
      { header: 'Value', key: 'value', width: 20 },
    ];

    summarySheet.getRow(1).font = { bold: true };
    summarySheet.addRow({
      metric: 'Total Transactions',
      value: donations.length,
    });
    summarySheet.addRow({ metric: 'Total Amount (IDR)', value: totalAmount });
    summarySheet.addRow({ metric: 'Completed', value: completed });
    summarySheet.addRow({ metric: 'Pending', value: pending });
    summarySheet.addRow({ metric: 'Failed', value: failed });

    return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
  }

  /**
   * Generate program report as Excel
   */
  async generateProgramReportExcel(): Promise<Buffer> {
    const programs = await this.programRepository.find({
      relations: ['donations'],
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Programs');

    worksheet.columns = [
      { header: 'Program Name', key: 'title', width: 25 },
      { header: 'Target (IDR)', key: 'target', width: 18 },
      { header: 'Collected (IDR)', key: 'collected', width: 18 },
      { header: 'Donors', key: 'donors', width: 12 },
      { header: 'Progress %', key: 'progress', width: 12 },
      { header: 'Status', key: 'status', width: 12 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF366092' },
    };

    programs.forEach((program) => {
      const progress =
        program.targetAmount && program.targetAmount > 0
          ? Math.min(
              Math.round(
                (program.collectedAmount / program.targetAmount) * 100,
              ),
              100,
            )
          : 0;

      worksheet.addRow({
        title: program.title,
        target: program.targetAmount,
        collected: program.collectedAmount,
        donors: program.donorCount,
        progress,
        status: program.status,
      });
    });

    // Format currency columns
    worksheet.getColumn('target').numFmt = '#,##0';
    worksheet.getColumn('collected').numFmt = '#,##0';

    return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
  }

  /**
   * Generate donor report as Excel
   */
  async generateDonorReportExcel(options: ReportOptions = {}): Promise<Buffer> {
    const donations = await this.getFilledDonations(options);

    // Group by donor
    const donorMap = new Map<
      string,
      {
        name: string;
        email: string;
        donations: number;
        totalAmount: number;
        lastDonation: Date;
      }
    >();

    donations
      .filter((d) => !d.isAnonymous && d.userId)
      .forEach((donation) => {
        const donorId = donation.userId;
        const donorName = donation.user?.name || 'Unknown';
        const email = donation.user?.email || 'N/A';

        if (!donorMap.has(donorId)) {
          donorMap.set(donorId, {
            name: donorName,
            email,
            donations: 0,
            totalAmount: 0,
            lastDonation: donation.createdAt,
          });
        }

        const donor = donorMap.get(donorId)!;
        donor.donations += 1;
        donor.totalAmount += donation.amount;
        if (donation.createdAt > donor.lastDonation) {
          donor.lastDonation = donation.createdAt;
        }
      });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Donors');

    worksheet.columns = [
      { header: 'Donor Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Total Donations', key: 'donations', width: 15 },
      { header: 'Total Amount (IDR)', key: 'amount', width: 18 },
      { header: 'Last Donation', key: 'lastDonation', width: 15 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF366092' },
    };

    Array.from(donorMap.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .forEach((donor) => {
        worksheet.addRow({
          name: donor.name,
          email: donor.email,
          donations: donor.donations,
          amount: donor.totalAmount,
          lastDonation: new Date(donor.lastDonation).toLocaleDateString(
            'id-ID',
          ),
        });
      });

    worksheet.getColumn('amount').numFmt = '#,##0';

    return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
  }

  /**
   * Get filtered donations with relations
   */
  private async getFilledDonations(options: ReportOptions) {
    const query = this.donationRepository
      .createQueryBuilder('donation')
      .leftJoinAndSelect('donation.user', 'user')
      .leftJoinAndSelect('donation.program', 'program')
      .orderBy('donation.createdAt', 'DESC');

    if (options.startDate) {
      query.andWhere('donation.createdAt >= :startDate', {
        startDate: options.startDate,
      });
    }

    if (options.endDate) {
      query.andWhere('donation.createdAt <= :endDate', {
        endDate: options.endDate,
      });
    }

    if (options.programId) {
      query.andWhere('donation.programId = :programId', {
        programId: options.programId,
      });
    }

    if (options.status) {
      query.andWhere('donation.status = :status', {
        status: options.status,
      });
    }

    return query.getMany();
  }

  /**
   * Format currency
   */
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  /**
   * Format payment method
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
