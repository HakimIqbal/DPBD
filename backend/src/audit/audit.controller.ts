import {
  Controller,
  Get,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Between,
  FindOptionsWhere,
  ILike,
  MoreThanOrEqual,
  LessThanOrEqual,
} from 'typeorm';
import { AuditLog } from '../entities';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/permissions';

interface PaginatedAuditLogs {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Controller('audit')
export class AuditController {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
  ) {}

  /**
   * GET /api/audit/logs
   *
   * Paginated audit trail with optional filters. Newest first.
   *
   * Query params:
   *   - page         (default 1, min 1)
   *   - limit        (default 50, min 1, max 200)
   *   - action       exact match on the action verb
   *   - entityType   exact match on the entity type
   *   - actorId      exact match on the actor UUID
   *   - actorEmail   case-insensitive substring match on the actor email
   *   - startDate    ISO 8601, inclusive lower bound on createdAt
   *   - endDate      ISO 8601, inclusive upper bound on createdAt
   */
  @Get('logs')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.READ_AUDIT_TRAIL)
  async listLogs(
    @Query('page') pageRaw?: string,
    @Query('limit') limitRaw?: string,
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
    @Query('actorId') actorId?: string,
    @Query('actorEmail') actorEmail?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<PaginatedAuditLogs> {
    const page = clampInt(pageRaw, 1, 1, Number.MAX_SAFE_INTEGER);
    const limit = clampInt(limitRaw, 50, 1, 200);

    const where: FindOptionsWhere<AuditLog> = {};
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    if (actorId) where.actorId = actorId;
    if (actorEmail) {
      // Substring + case-insensitive so the UI search box can do partial
      // matching against the snapshotted actor email.
      where.actorEmail = ILike(`%${actorEmail}%`);
    }

    const start = parseDate(startDate, 'startDate');
    const end = parseDate(endDate, 'endDate');
    if (start && end) {
      where.createdAt = Between(start, end);
    } else if (start) {
      where.createdAt = MoreThanOrEqual(start);
    } else if (end) {
      where.createdAt = LessThanOrEqual(end);
    }

    const [data, total] = await this.auditRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }
}

function clampInt(raw: string | undefined, fallback: number, min: number, max: number): number {
  if (raw === undefined || raw === '') return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function parseDate(raw: string | undefined, paramName: string): Date | null {
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) {
    throw new BadRequestException(`Invalid ${paramName}: must be ISO-8601`);
  }
  return d;
}
