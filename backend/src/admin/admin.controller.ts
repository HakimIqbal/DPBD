import {
  Controller,
  Post,
  Put,
  Get,
  Body,
  BadRequestException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AdminService, BulkActionResult } from './admin.service';
import {
  BulkApproveDto,
  BulkRejectDto,
  BulkRefundDto,
  BulkStatusUpdateDto,
} from './dto/bulk-action.dto';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuditService } from '../audit/audit.service';
import { auditActorFromReq } from '../audit/audit-actor.util';
import type { AuthenticatedRequest } from '../types';

@Controller('admin')
export class AdminController {
  constructor(
    private adminService: AdminService,
    private auditService: AuditService,
  ) {}

  /**
   * Bulk approve pending donations
   */
  @Post('donations/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async approveDonations(
    @Body() dto: BulkApproveDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<BulkActionResult> {
    if (!dto.donationIds || dto.donationIds.length === 0) {
      throw new BadRequestException('No donation IDs provided');
    }

    const result = await this.adminService.bulkApproveDonations(dto.donationIds);
    await this.logBulkDonationOutcome(req, dto.donationIds, result, 'DONATION_APPROVED');
    return result;
  }

  /**
   * Bulk reject donations
   */
  @Post('donations/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async rejectDonations(
    @Body() dto: BulkRejectDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<BulkActionResult> {
    if (!dto.donationIds || dto.donationIds.length === 0) {
      throw new BadRequestException('No donation IDs provided');
    }

    const result = await this.adminService.bulkRejectDonations(dto.donationIds, dto.reason);
    await this.logBulkDonationOutcome(req, dto.donationIds, result, 'DONATION_REJECTED', {
      reason: dto.reason ?? null,
    });
    return result;
  }

  /**
   * Bulk refund completed donations
   */
  @Post('donations/refund')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async refundDonations(
    @Body() dto: BulkRefundDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<BulkActionResult> {
    if (!dto.donationIds || dto.donationIds.length === 0) {
      throw new BadRequestException('No donation IDs provided');
    }

    const result = await this.adminService.bulkRefundDonations(dto.donationIds, dto.reason);
    await this.logBulkDonationOutcome(req, dto.donationIds, result, 'DONATION_REFUNDED', {
      reason: dto.reason ?? null,
    });
    return result;
  }

  /**
   * Bulk update donation status
   */
  @Put('donations/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getSummary() {
    return this.adminService.getBulkActionSummary();
  }

  /**
   * Create an organizational user account. Restricted to `admin` and `ceo`
   * because creating elevated accounts is itself an elevated operation.
   * Donor roles (personal/company) are rejected by the DTO — those self-
   * register via /api/auth/register.
   */
  @Post('users/create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'ceo')
  async createOrgUser(
    @Body() dto: CreateAdminUserDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.adminService.createUser(dto, auditActorFromReq(req));
  }

  /**
   * Emit one audit log per donation that was *successfully* processed by
   * the bulk operation. Failed IDs (already in the wrong state, missing
   * row, etc.) are intentionally NOT logged — the audit trail records
   * actions that took effect, not ones that were rejected by validation.
   */
  private async logBulkDonationOutcome(
    req: AuthenticatedRequest,
    requestedIds: string[],
    result: BulkActionResult,
    action: 'DONATION_APPROVED' | 'DONATION_REJECTED' | 'DONATION_REFUNDED',
    extraMetadata?: Record<string, unknown>,
  ): Promise<void> {
    const failed = new Set(result.failedIds);
    const succeeded = requestedIds.filter((id) => !failed.has(id));
    const actor = auditActorFromReq(req);

    await Promise.all(
      succeeded.map((id) =>
        this.auditService.log({
          ...actor,
          action,
          entityType: 'Donation',
          entityId: id,
          metadata: extraMetadata ?? null,
        }),
      ),
    );
  }
}
