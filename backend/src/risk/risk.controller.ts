import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/permissions';
import type { AuthenticatedRequest } from '../types';
import type { RiskSeverity } from '../entities';
import { RiskService } from './risk.service';
import { CreateThresholdDto, UpdateThresholdDto } from './dto/threshold.dto';

function parseBool(v: string | undefined): boolean | undefined {
  if (v === undefined) return undefined;
  if (v === 'true' || v === '1') return true;
  if (v === 'false' || v === '0') return false;
  return undefined;
}

@Controller('risk')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RiskController {
  constructor(private readonly riskService: RiskService) {}

  // -------- Thresholds --------

  /**
   * GET /api/risk/thresholds?isActive=&severity=&metricKey=&page=&limit=
   * Paginated list of configured thresholds, newest-first.
   */
  @Get('thresholds')
  @RequirePermissions(Permission.READ_RISK)
  async getThresholds(
    @Query('isActive') isActive?: string,
    @Query('severity') severity?: RiskSeverity,
    @Query('metricKey') metricKey?: string,
    @Query('page') pageRaw?: string,
    @Query('limit') limitRaw?: string,
  ) {
    return this.riskService.getThresholds({
      isActive: parseBool(isActive),
      severity,
      metricKey,
      page: pageRaw ? Number.parseInt(pageRaw, 10) : undefined,
      limit: limitRaw ? Number.parseInt(limitRaw, 10) : undefined,
    });
  }

  @Post('thresholds')
  @RequirePermissions(Permission.WRITE_RISK)
  async createThreshold(
    @Body() dto: CreateThresholdDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.riskService.createThreshold(dto, req.user.id);
  }

  @Patch('thresholds/:id')
  @RequirePermissions(Permission.WRITE_RISK)
  async updateThreshold(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateThresholdDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.riskService.updateThreshold(id, dto, req.user.id);
  }

  /**
   * DELETE /api/risk/thresholds/:id — soft delete (isActive=false). The
   * row stays so historical alert messages keep their context.
   */
  @Delete('thresholds/:id')
  @RequirePermissions(Permission.WRITE_RISK)
  async deleteThreshold(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.riskService.deleteThreshold(id, req.user.id);
  }

  // -------- Evaluation --------

  /**
   * POST /api/risk/evaluate — manually trigger an evaluation pass. Each
   * call produces a point-in-time snapshot; alerts are appended, not
   * deduped against existing unresolved ones.
   */
  @Post('evaluate')
  @RequirePermissions(Permission.WRITE_RISK)
  async evaluate(@Req() req: AuthenticatedRequest) {
    return this.riskService.evaluateAllThresholds(req.user.id);
  }

  // -------- Alerts --------

  @Get('alerts')
  @RequirePermissions(Permission.READ_RISK)
  async getAlerts(
    @Query('isResolved') isResolved?: string,
    @Query('severity') severity?: RiskSeverity,
    @Query('thresholdId') thresholdId?: string,
    @Query('page') pageRaw?: string,
    @Query('limit') limitRaw?: string,
  ) {
    return this.riskService.getAlerts({
      isResolved: parseBool(isResolved),
      severity,
      thresholdId,
      page: pageRaw ? Number.parseInt(pageRaw, 10) : undefined,
      limit: limitRaw ? Number.parseInt(limitRaw, 10) : undefined,
    });
  }

  @Patch('alerts/:id/resolve')
  @RequirePermissions(Permission.WRITE_RISK)
  async resolveAlert(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.riskService.resolveAlert(id, req.user.id);
  }
}
