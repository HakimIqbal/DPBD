import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  InstrumentType,
  Investment,
  InvestmentStatus,
  InvestmentTransaction,
} from '../entities';
import { AuditService } from '../audit/audit.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { UpdateInvestmentDto } from './dto/update-investment.dto';
import { AddTransactionDto } from './dto/add-transaction.dto';

export interface AllocationByType {
  type: InstrumentType;
  amount: number;
  percentage: number;
}

export interface PortfolioSummary {
  totalPrincipal: number;
  totalCurrentValue: number;
  totalReturn: number;
  returnPercentage: number;
  allocationByType: AllocationByType[];
  activeCount: number;
  maturedCount: number;
}

export interface PaginatedInvestments {
  data: Investment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface InvestmentDetail {
  investment: Investment;
  transactions: InvestmentTransaction[];
}

interface ListFilters {
  instrumentType?: InstrumentType;
  status?: InvestmentStatus;
  page?: number;
  limit?: number;
}

/** Convert a `decimal(18,2)` string from the DB to a JS number for math/display. */
function toNumber(decimalString: string | null | undefined): number {
  if (decimalString === null || decimalString === undefined) return 0;
  const n = Number(decimalString);
  return Number.isFinite(n) ? n : 0;
}

/** Convert a JS number to a fixed-2 string for inserting into a decimal column. */
function toDecimalString(value: number): string {
  return value.toFixed(2);
}

@Injectable()
export class InvestmentService {
  constructor(
    @InjectRepository(Investment)
    private readonly investmentRepo: Repository<Investment>,
    @InjectRepository(InvestmentTransaction)
    private readonly transactionRepo: Repository<InvestmentTransaction>,
    private readonly dataSource: DataSource,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Most recent transactions across the entire portfolio, newest first.
   * Used by the Investment Manager dashboard. Capped at 50 to bound
   * response size; defaults to 5 to match the dashboard's footprint.
   */
  async getRecentTransactions(limit = 5): Promise<InvestmentTransaction[]> {
    const safeLimit = Math.max(1, Math.min(50, Math.floor(limit)));
    return this.transactionRepo.find({
      order: { transactionDate: 'DESC', createdAt: 'DESC' },
      take: safeLimit,
    });
  }

  /**
   * Aggregate portfolio statistics: totals, return %, allocation pie,
   * and lifecycle counts. Computed in JS from the full row set rather
   * than pushed to SQL — the portfolio is small (dozens to low
   * hundreds) and keeping the math here makes it trivial to evolve the
   * shape without writing new queries each time.
   */
  async getSummary(): Promise<PortfolioSummary> {
    const all = await this.investmentRepo.find();

    let totalPrincipal = 0;
    let totalCurrentValue = 0;
    let totalActualReturn = 0;
    let activeCount = 0;
    let maturedCount = 0;

    // Bucket current value per instrument type for the allocation chart.
    const allocationMap = new Map<InstrumentType, number>();

    for (const inv of all) {
      const principal = toNumber(inv.principalAmount);
      const current = toNumber(inv.currentValue);
      const actual = toNumber(inv.actualReturnAmount);

      totalPrincipal += principal;
      totalCurrentValue += current;
      totalActualReturn += actual;

      if (inv.status === 'active') activeCount += 1;
      if (inv.status === 'matured') maturedCount += 1;

      allocationMap.set(
        inv.instrumentType,
        (allocationMap.get(inv.instrumentType) ?? 0) + current,
      );
    }

    // Total return = unrealized (current - principal) + realized (cumulative
    // returns received). This is the "total profit so far" view a CFO would
    // expect on the dashboard.
    const totalReturn = totalCurrentValue - totalPrincipal + totalActualReturn;
    const returnPercentage =
      totalPrincipal > 0 ? (totalReturn / totalPrincipal) * 100 : 0;

    const allocationByType: AllocationByType[] = Array.from(
      allocationMap.entries(),
    )
      .map(([type, amount]) => ({
        type,
        amount,
        percentage: totalCurrentValue > 0 ? (amount / totalCurrentValue) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      totalPrincipal,
      totalCurrentValue,
      totalReturn,
      returnPercentage,
      allocationByType,
      activeCount,
      maturedCount,
    };
  }

  /**
   * Paginated, optionally filtered list. Defaults: page 1, 50 per page.
   * `limit` is clamped to [1, 200] to bound query cost.
   */
  async getAll(filters: ListFilters = {}): Promise<PaginatedInvestments> {
    const page = Math.max(1, Math.floor(filters.page ?? 1));
    const limit = Math.max(1, Math.min(200, Math.floor(filters.limit ?? 50)));

    const qb = this.investmentRepo
      .createQueryBuilder('i')
      .orderBy('i.purchaseDate', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (filters.instrumentType) {
      qb.andWhere('i.instrumentType = :instrumentType', {
        instrumentType: filters.instrumentType,
      });
    }
    if (filters.status) {
      qb.andWhere('i.status = :status', { status: filters.status });
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  /**
   * Detail view: investment row + full transaction journal newest-first.
   * The frontend uses this both for the detail panel and to drive the
   * "actual realized return" reconciliation view.
   */
  async getById(id: string): Promise<InvestmentDetail> {
    const investment = await this.investmentRepo.findOne({ where: { id } });
    if (!investment) {
      throw new NotFoundException(`Investment ${id} not found`);
    }

    const transactions = await this.transactionRepo.find({
      where: { investmentId: id },
      order: { transactionDate: 'DESC', createdAt: 'DESC' },
    });

    return { investment, transactions };
  }

  async create(
    dto: CreateInvestmentDto,
    actorId: string | null,
  ): Promise<Investment> {
    const investment = this.investmentRepo.create({
      name: dto.name,
      instrumentType: dto.instrumentType,
      institution: dto.institution,
      principalAmount: toDecimalString(dto.principalAmount),
      currentValue: toDecimalString(dto.currentValue),
      purchaseDate: dto.purchaseDate.slice(0, 10),
      maturityDate: dto.maturityDate ? dto.maturityDate.slice(0, 10) : null,
      expectedReturnRate:
        dto.expectedReturnRate !== undefined
          ? dto.expectedReturnRate.toFixed(2)
          : null,
      notes: dto.notes ?? null,
      createdBy: actorId,
      status: 'active',
    });

    const saved = await this.investmentRepo.save(investment);

    await this.auditService.log({
      actorId,
      action: 'INVESTMENT_CREATED',
      entityType: 'Investment',
      entityId: saved.id,
      metadata: {
        name: saved.name,
        instrumentType: saved.instrumentType,
        institution: saved.institution,
        principalAmount: saved.principalAmount,
      },
    });

    return saved;
  }

  async update(
    id: string,
    dto: UpdateInvestmentDto,
    actorId: string | null,
  ): Promise<Investment> {
    const investment = await this.investmentRepo.findOne({ where: { id } });
    if (!investment) {
      throw new NotFoundException(`Investment ${id} not found`);
    }

    // Track which fields actually changed so the audit log captures intent.
    const changes: Record<string, { from: unknown; to: unknown }> = {};

    const apply = <K extends keyof Investment>(
      key: K,
      value: Investment[K] | undefined,
    ) => {
      if (value === undefined) return;
      if (investment[key] !== value) {
        changes[key as string] = { from: investment[key], to: value };
        investment[key] = value;
      }
    };

    apply('name', dto.name as Investment['name']);
    apply('instrumentType', dto.instrumentType as Investment['instrumentType']);
    apply('institution', dto.institution as Investment['institution']);
    if (dto.principalAmount !== undefined) {
      apply('principalAmount', toDecimalString(dto.principalAmount));
    }
    if (dto.currentValue !== undefined) {
      apply('currentValue', toDecimalString(dto.currentValue));
    }
    if (dto.purchaseDate !== undefined) {
      apply('purchaseDate', dto.purchaseDate.slice(0, 10));
    }
    if (dto.maturityDate !== undefined) {
      apply('maturityDate', dto.maturityDate.slice(0, 10));
    }
    if (dto.expectedReturnRate !== undefined) {
      apply('expectedReturnRate', dto.expectedReturnRate.toFixed(2));
    }
    if (dto.actualReturnAmount !== undefined) {
      apply('actualReturnAmount', toDecimalString(dto.actualReturnAmount));
    }
    apply('status', dto.status as Investment['status']);
    apply('notes', dto.notes as Investment['notes']);

    const saved = await this.investmentRepo.save(investment);

    await this.auditService.log({
      actorId,
      action: 'INVESTMENT_UPDATED',
      entityType: 'Investment',
      entityId: saved.id,
      metadata: { changes },
    });

    return saved;
  }

  /**
   * Save a transaction journal entry and apply its derived effects on the
   * parent investment. The save + investment update happen in a single DB
   * transaction so the journal can never be out of sync with the parent
   * row (e.g. process killed between the two writes).
   *
   * Side-effect map (per spec):
   *   - value_update         → currentValue := txn.amount
   *   - return_received      → actualReturnAmount += txn.amount
   *   - full_liquidation     → status := 'liquidated' AND currentValue := txn.amount
   *   - partial_liquidation  → principalAmount -= txn.amount (rejected if it would
   *                             go below zero — caller specifying more than the
   *                             remaining principal is a programmer / data error)
   *   - purchase             → recorded only, no derived state mutation
   */
  async addTransaction(
    investmentId: string,
    dto: AddTransactionDto,
    actorId: string | null,
  ): Promise<{
    investment: Investment;
    transaction: InvestmentTransaction;
  }> {
    const result = await this.dataSource.transaction(async (manager) => {
      const investmentRepo = manager.getRepository(Investment);
      const txRepo = manager.getRepository(InvestmentTransaction);

      const investment = await investmentRepo.findOne({
        where: { id: investmentId },
      });
      if (!investment) {
        throw new NotFoundException(`Investment ${investmentId} not found`);
      }

      // Reject mutations against a liquidated row to keep history immutable
      // beyond end-of-life — except for retrospective `value_update` is
      // pointless once liquidated, so block that too.
      if (
        investment.status === 'liquidated' &&
        dto.transactionType !== 'return_received'
      ) {
        throw new BadRequestException(
          'Cannot post non-return transactions to a liquidated investment',
        );
      }

      const txn = txRepo.create({
        investmentId,
        transactionType: dto.transactionType,
        amount: toDecimalString(dto.amount),
        transactionDate: dto.transactionDate.slice(0, 10),
        notes: dto.notes ?? null,
        recordedBy: actorId,
      });
      const savedTxn = await txRepo.save(txn);

      // Derived effects
      switch (dto.transactionType) {
        case 'value_update':
          investment.currentValue = toDecimalString(dto.amount);
          break;
        case 'return_received': {
          const next = toNumber(investment.actualReturnAmount) + dto.amount;
          investment.actualReturnAmount = toDecimalString(next);
          break;
        }
        case 'full_liquidation':
          // End-of-life: stamp the final realised value AND flip status
          // so summary aggregates and dashboards stop counting this as
          // active capital.
          investment.status = 'liquidated';
          investment.currentValue = toDecimalString(dto.amount);
          break;
        case 'partial_liquidation': {
          // Pull cash back out of the position by reducing principal. We
          // reject going below zero because the data model has no notion
          // of negative principal — a request that would produce one is
          // a caller bug worth surfacing.
          const remaining = toNumber(investment.principalAmount) - dto.amount;
          if (remaining < 0) {
            throw new BadRequestException(
              'Partial liquidation exceeds remaining principal',
            );
          }
          investment.principalAmount = toDecimalString(remaining);
          break;
        }
        case 'purchase':
          // Recorded for the audit trail only.
          break;
      }

      const savedInvestment = await investmentRepo.save(investment);
      return { investment: savedInvestment, transaction: savedTxn };
    });

    await this.auditService.log({
      actorId,
      action: 'INVESTMENT_TRANSACTION',
      entityType: 'Investment',
      entityId: investmentId,
      metadata: {
        transactionId: result.transaction.id,
        transactionType: dto.transactionType,
        amount: result.transaction.amount,
        transactionDate: result.transaction.transactionDate,
      },
    });

    return result;
  }
}
