import {
  Controller,
  Post,
  Put,
  Get,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { AdminService, BulkActionResult } from './admin.service';
import {
  BulkApproveDto,
  BulkRejectDto,
  BulkRefundDto,
  BulkStatusUpdateDto,
} from './dto/bulk-action.dto';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  /**
   * Bulk approve pending donations
   */
  @Post('donations/approve')
  async approveDonations(
    @Body() dto: BulkApproveDto,
  ): Promise<BulkActionResult> {
    if (!dto.donationIds || dto.donationIds.length === 0) {
      throw new BadRequestException('No donation IDs provided');
    }

    return this.adminService.bulkApproveDonations(dto.donationIds);
  }

  /**
   * Bulk reject donations
   */
  @Post('donations/reject')
  async rejectDonations(@Body() dto: BulkRejectDto): Promise<BulkActionResult> {
    if (!dto.donationIds || dto.donationIds.length === 0) {
      throw new BadRequestException('No donation IDs provided');
    }

    return this.adminService.bulkRejectDonations(dto.donationIds, dto.reason);
  }

  /**
   * Bulk refund completed donations
   */
  @Post('donations/refund')
  async refundDonations(@Body() dto: BulkRefundDto): Promise<BulkActionResult> {
    if (!dto.donationIds || dto.donationIds.length === 0) {
      throw new BadRequestException('No donation IDs provided');
    }

    return this.adminService.bulkRefundDonations(dto.donationIds, dto.reason);
  }

  /**
   * Bulk update donation status
   */
  @Put('donations/status')
  async updateDonationStatus(
    @Body() dto: BulkStatusUpdateDto,
  ): Promise<BulkActionResult> {
    if (!dto.donationIds || dto.donationIds.length === 0) {
      throw new BadRequestException('No donation IDs provided');
    }

    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    if (!validStatuses.includes(dto.status)) {
      throw new BadRequestException(`Invalid status: ${dto.status}`);
    }

    return this.adminService.bulkUpdateStatus(dto.donationIds, dto.status);
  }

  /**
   * Get bulk action summary
   */
  @Get('donations/summary')
  async getSummary() {
    return this.adminService.getBulkActionSummary();
  }
}
