import {
  Body,
  Controller,
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
import type {
  InstrumentType,
  InvestmentStatus,
} from '../entities';
import { InvestmentService } from './investment.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { UpdateInvestmentDto } from './dto/update-investment.dto';
import { AddTransactionDto } from './dto/add-transaction.dto';

@Controller('investments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class InvestmentController {
  constructor(private readonly investmentService: InvestmentService) {}

  /**
   * GET /api/investments/summary
   * Aggregate dashboard stats. Declared BEFORE the `:id` route so NestJS
   * doesn't route 'summary' as an UUID lookup.
   */
  @Get('summary')
  @RequirePermissions(Permission.READ_PORTFOLIO)
  async getSummary() {
    return this.investmentService.getSummary();
  }

  /**
   * GET /api/investments?instrumentType=&status=&page=&limit=
   * Paginated list, newest purchase date first.
   */
  @Get()
  @RequirePermissions(Permission.READ_PORTFOLIO)
  async getAll(
    @Query('instrumentType') instrumentType?: InstrumentType,
    @Query('status') status?: InvestmentStatus,
    @Query('page') pageRaw?: string,
    @Query('limit') limitRaw?: string,
  ) {
    return this.investmentService.getAll({
      instrumentType,
      status,
      page: pageRaw ? Number.parseInt(pageRaw, 10) : undefined,
      limit: limitRaw ? Number.parseInt(limitRaw, 10) : undefined,
    });
  }

  /** GET /api/investments/:id — investment + transaction journal. */
  @Get(':id')
  @RequirePermissions(Permission.READ_PORTFOLIO)
  async getById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.investmentService.getById(id);
  }

  /** POST /api/investments — create a new instrument record. */
  @Post()
  @RequirePermissions(Permission.WRITE_PORTFOLIO)
  async create(
    @Body() dto: CreateInvestmentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.investmentService.create(dto, req.user.id);
  }

  /** PATCH /api/investments/:id — partial update with audit trail. */
  @Patch(':id')
  @RequirePermissions(Permission.WRITE_PORTFOLIO)
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateInvestmentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.investmentService.update(id, dto, req.user.id);
  }

  /**
   * POST /api/investments/:id/transactions — append a journal entry and
   * apply its derived effects on the parent (currentValue / cumulative
   * return / status). See InvestmentService.addTransaction for details.
   */
  @Post(':id/transactions')
  @RequirePermissions(Permission.WRITE_PORTFOLIO)
  async addTransaction(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: AddTransactionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.investmentService.addTransaction(id, dto, req.user.id);
  }
}
