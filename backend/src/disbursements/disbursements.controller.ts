import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/permissions';
import type { AuthenticatedRequest } from '../types';
import {
  DisbursementsService,
  type DisbursementListItem,
} from './disbursements.service';
import { AuditService } from '../audit/audit.service';
import { auditActorFromReq } from '../audit/audit-actor.util';
import type { Disbursement } from '../entities/disbursement.entity';

class RejectDisbursementDto {
  @IsString()
  @MinLength(1, { message: 'Alasan penolakan wajib diisi.' })
  @MaxLength(2000)
  reason: string;
}

class ApproveDisbursementDto {
  // Optional reviewer note. Stored nowhere yet, but accepting it here
  // lets the frontend send it without 400-ing — saves a future round
  // trip when we add a `reviewerNote` column.
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;
}

@Controller('disbursements')
export class DisbursementsController {
  constructor(
    private readonly service: DisbursementsService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * GET /api/disbursements/pending
   * CFO approval queue. Anything in 'pending' status is owed a decision.
   * Read-only; gated on APPROVE_DISBURSEMENT (admin/ceo/cfo/finance).
   */
  @Get('pending')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.APPROVE_DISBURSEMENT)
  async findPending(): Promise<DisbursementListItem[]> {
    return this.service.findPending();
  }

  /**
   * GET /api/disbursements
   * Full list across all statuses. The legacy admin disbursements page
   * fetches this and filters client-side. Same permission as pending —
   * if you can review the queue, you can see history.
   */
  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.APPROVE_DISBURSEMENT)
  async findAll(): Promise<DisbursementListItem[]> {
    return this.service.findAll();
  }

  /**
   * PATCH /api/disbursements/:id/approve
   * Move pending → approved. Captures the reviewer on the row and
   * writes a DISBURSEMENT_APPROVED audit row. Idempotent failure: a
   * second approve on an already-approved row throws 409 — the audit
   * trail must reflect a single canonical decision per request.
   */
  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.APPROVE_DISBURSEMENT)
  async approve(
    @Param('id') id: string,
    @Body() _dto: ApproveDisbursementDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Disbursement> {
    if (!req.user?.id) {
      throw new BadRequestException('Authenticated user has no id on request');
    }
    const updated = await this.service.approve(id, req.user.id);
    await this.auditService.log({
      ...auditActorFromReq(req),
      action: 'DISBURSEMENT_APPROVED',
      entityType: 'Disbursement',
      entityId: updated.id,
      metadata: {
        amount: typeof updated.amount === 'string' ? Number(updated.amount) : updated.amount,
        programId: updated.programId,
      },
    });
    return updated;
  }

  /**
   * PATCH /api/disbursements/:id/reject
   * Move pending → rejected. Reason is required by the DTO (reject
   * without a reason is an audit hole). Stores reason on the row and
   * mirrors it to the audit metadata for cross-system queries.
   */
  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.APPROVE_DISBURSEMENT)
  async reject(
    @Param('id') id: string,
    @Body() dto: RejectDisbursementDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Disbursement> {
    if (!req.user?.id) {
      throw new BadRequestException('Authenticated user has no id on request');
    }
    const updated = await this.service.reject(id, req.user.id, dto.reason);
    await this.auditService.log({
      ...auditActorFromReq(req),
      action: 'DISBURSEMENT_REJECTED',
      entityType: 'Disbursement',
      entityId: updated.id,
      metadata: {
        amount: typeof updated.amount === 'string' ? Number(updated.amount) : updated.amount,
        programId: updated.programId,
        reason: dto.reason,
      },
    });
    return updated;
  }
}
