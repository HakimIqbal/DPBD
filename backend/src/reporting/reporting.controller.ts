import {
  Controller,
  Get,
  Query,
  Res,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ReportingService } from './reporting.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'finance', 'editor')
export class ReportingController {
  constructor(private reportingService: ReportingService) {}

  /**
   * Generate transaction report as PDF
   * GET /reports/transactions/pdf
   */
  @Get('transactions/pdf')
  async getTransactionReportPDF(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('programId') programId?: string,
    @Query('status') status?: string,
    @Res() res?: Response,
  ): Promise<void> {
    const options = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      programId,
      status,
    };

    try {
      const buffer =
        await this.reportingService.generateTransactionReportPDF(options);

      res?.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="transaction-report.pdf"',
        'Content-Length': buffer.length,
      });

      res?.end(buffer);
    } catch (error) {
      throw new BadRequestException(
        `Failed to generate report: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Generate transaction report as Excel
   * GET /reports/transactions/excel
   */
  @Get('transactions/excel')
  async getTransactionReportExcel(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('programId') programId?: string,
    @Query('status') status?: string,
    @Res() res?: Response,
  ): Promise<void> {
    const options = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      programId,
      status,
    };

    try {
      const buffer =
        await this.reportingService.generateTransactionReportExcel(options);

      res?.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="transaction-report.xlsx"',
        'Content-Length': buffer.length,
      });

      res?.end(buffer);
    } catch (error) {
      throw new BadRequestException(
        `Failed to generate report: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Generate program report as Excel
   * GET /reports/programs/excel
   */
  @Get('programs/excel')
  async getProgramReportExcel(@Res() res?: Response): Promise<void> {
    try {
      const buffer = await this.reportingService.generateProgramReportExcel();

      res?.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="program-report.xlsx"',
        'Content-Length': buffer.length,
      });

      res?.end(buffer);
    } catch (error) {
      throw new BadRequestException(
        `Failed to generate report: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Generate donor report as Excel
   * GET /reports/donors/excel
   */
  @Get('donors/excel')
  async getDonorReportExcel(@Res() res?: Response): Promise<void> {
    try {
      const buffer = await this.reportingService.generateDonorReportExcel();

      res?.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="donor-report.xlsx"',
        'Content-Length': buffer.length,
      });

      res?.end(buffer);
    } catch (error) {
      throw new BadRequestException(
        `Failed to generate report: ${(error as Error).message}`,
      );
    }
  }
}
