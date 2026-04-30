import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Disbursement } from '../entities/disbursement.entity';
import type { DisbursementStatus } from '../entities/disbursement.entity';

/**
 * Shape returned by the controller for queue listings — flat,
 * frontend-friendly. Computed from the joined `program` and the
 * `requestedByUser` relation so the UI can show "Program: X / Diajukan
 * oleh: Y" without N+1 lookups.
 */
export interface DisbursementListItem {
  id: string;
  status: DisbursementStatus;
  amount: number;
  recipient: string;
  description: string | null;
  programId: string;
  programName: string;
  requestedById: string | null;
  requestedByName: string | null;
  requestedByEmail: string | null;
  requestedAt: string | null;
  reviewedById: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class DisbursementsService {
  constructor(
    @InjectRepository(Disbursement)
    private readonly repo: Repository<Disbursement>,
  ) {}

  /**
   * Disbursements awaiting CFO review. Includes pending only — once
   * approved/rejected/processed, they leave this queue.
   */
  async findPending(): Promise<DisbursementListItem[]> {
    const rows = await this.repo.find({
      where: { status: 'pending' },
      relations: ['program', 'requestedByUser'],
      order: { requestedAt: 'DESC', createdAt: 'DESC' },
    });
    return rows.map(toListItem);
  }

  /**
   * Full list — used by the admin page that shows everything regardless
   * of status. Frontend filters client-side for now since the dataset is
   * still small.
   */
  async findAll(): Promise<DisbursementListItem[]> {
    const rows = await this.repo.find({
      relations: ['program', 'requestedByUser'],
      order: { createdAt: 'DESC' },
    });
    return rows.map(toListItem);
  }

  async findById(id: string): Promise<Disbursement> {
    const row = await this.repo.findOne({
      where: { id },
      relations: ['program', 'requestedByUser', 'reviewedByUser'],
    });
    if (!row) {
      throw new NotFoundException(`Disbursement ${id} not found`);
    }
    return row;
  }

  /**
   * Approve a pending disbursement. Captures the reviewing actor on the
   * row so the audit trail survives even if the audit_logs table is
   * later truncated. Refuses to act on non-pending rows — the lifecycle
   * forbids re-review.
   */
  async approve(id: string, reviewerId: string): Promise<Disbursement> {
    const row = await this.findById(id);
    if (row.status !== 'pending') {
      throw new ConflictException(
        `Cannot approve a disbursement in status '${row.status}'. Only pending requests are reviewable.`,
      );
    }
    row.status = 'approved';
    row.reviewedBy = reviewerId;
    row.reviewedAt = new Date();
    row.rejectionReason = null;
    return this.repo.save(row);
  }

  /**
   * Reject a pending disbursement. `reason` required (non-empty string)
   * — rejection without a reason is an audit hole.
   */
  async reject(
    id: string,
    reviewerId: string,
    reason: string,
  ): Promise<Disbursement> {
    if (!reason || reason.trim().length === 0) {
      throw new BadRequestException('Rejection reason is required.');
    }
    const row = await this.findById(id);
    if (row.status !== 'pending') {
      throw new ConflictException(
        `Cannot reject a disbursement in status '${row.status}'. Only pending requests are reviewable.`,
      );
    }
    row.status = 'rejected';
    row.reviewedBy = reviewerId;
    row.reviewedAt = new Date();
    row.rejectionReason = reason.trim();
    return this.repo.save(row);
  }
}

function toListItem(d: Disbursement): DisbursementListItem {
  const requester = d.requestedByUser ?? null;
  return {
    id: d.id,
    status: d.status,
    amount: typeof d.amount === 'string' ? Number(d.amount) : d.amount,
    recipient: d.recipient,
    description: d.description ?? null,
    programId: d.programId,
    programName: d.program?.title ?? '(program tidak ditemukan)',
    requestedById: requester?.id ?? null,
    requestedByName: requester?.name ?? null,
    requestedByEmail: requester?.email ?? null,
    requestedAt: d.requestedAt ? d.requestedAt.toISOString() : null,
    reviewedById: d.reviewedBy ?? null,
    reviewedAt: d.reviewedAt ? d.reviewedAt.toISOString() : null,
    rejectionReason: d.rejectionReason ?? null,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  };
}
