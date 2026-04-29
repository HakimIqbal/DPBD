import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  RiskAlert,
  RiskOperator,
  RiskSeverity,
  RiskThreshold,
} from '../entities';
import { AuditService } from '../audit/audit.service';
import { InvestmentService } from '../investment/investment.service';
import { CreateThresholdDto, UpdateThresholdDto } from './dto/threshold.dto';
import { computeMetric, metricUnit } from './risk-metrics';

export interface PaginatedThresholds {
  data: RiskThreshold[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedAlerts {
  data: RiskAlert[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ThresholdFilters {
  isActive?: boolean;
  severity?: RiskSeverity;
  metricKey?: string;
  page?: number;
  limit?: number;
}

interface AlertFilters {
  isResolved?: boolean;
  severity?: RiskSeverity;
  thresholdId?: string;
  page?: number;
  limit?: number;
}

export interface EvaluationResult {
  evaluatedThresholds: number;
  triggeredAlerts: RiskAlert[];
}

function toDecimalString4(value: number): string {
  return value.toFixed(4);
}

function toNumber(decimalString: string | null | undefined): number {
  if (decimalString === null || decimalString === undefined) return 0;
  const n = Number(decimalString);
  return Number.isFinite(n) ? n : 0;
}

function isBreached(
  actual: number,
  operator: RiskOperator,
  threshold: number,
): boolean {
  switch (operator) {
    case 'greater_than':
      return actual > threshold;
    case 'less_than':
      return actual < threshold;
    case 'equals':
      return actual === threshold;
  }
}

function operatorLabel(op: RiskOperator): string {
  switch (op) {
    case 'greater_than':
      return '>';
    case 'less_than':
      return '<';
    case 'equals':
      return '=';
  }
}

@Injectable()
export class RiskService {
  constructor(
    @InjectRepository(RiskThreshold)
    private readonly thresholdRepo: Repository<RiskThreshold>,
    @InjectRepository(RiskAlert)
    private readonly alertRepo: Repository<RiskAlert>,
    private readonly auditService: AuditService,
    private readonly investmentService: InvestmentService,
  ) {}

  // -------- Thresholds --------

  /**
   * Paginated list of thresholds. Defaults: page 1, 50 per page; limit
   * clamped to [1, 200] to bound query cost. Filterable by activity,
   * severity, and metric.
   */
  async getThresholds(
    filters: ThresholdFilters = {},
  ): Promise<PaginatedThresholds> {
    const page = Math.max(1, Math.floor(filters.page ?? 1));
    const limit = Math.max(1, Math.min(200, Math.floor(filters.limit ?? 50)));

    const qb = this.thresholdRepo
      .createQueryBuilder('t')
      .orderBy('t.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (filters.isActive !== undefined) {
      qb.andWhere('t.isActive = :isActive', { isActive: filters.isActive });
    }
    if (filters.severity) {
      qb.andWhere('t.severity = :severity', { severity: filters.severity });
    }
    if (filters.metricKey) {
      qb.andWhere('t.metricKey = :metricKey', { metricKey: filters.metricKey });
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

  async createThreshold(
    dto: CreateThresholdDto,
    actorId: string | null,
  ): Promise<RiskThreshold> {
    const threshold = this.thresholdRepo.create({
      name: dto.name,
      metricKey: dto.metricKey,
      operator: dto.operator,
      thresholdValue: toDecimalString4(dto.thresholdValue),
      severity: dto.severity,
      description: dto.description ?? null,
      isActive: dto.isActive ?? true,
      createdBy: actorId,
    });
    const saved = await this.thresholdRepo.save(threshold);

    await this.auditService.log({
      actorId,
      action: 'RISK_THRESHOLD_CREATED',
      entityType: 'RiskThreshold',
      entityId: saved.id,
      metadata: {
        name: saved.name,
        metricKey: saved.metricKey,
        operator: saved.operator,
        thresholdValue: saved.thresholdValue,
        severity: saved.severity,
      },
    });

    return saved;
  }

  async updateThreshold(
    id: string,
    dto: UpdateThresholdDto,
    actorId: string | null,
  ): Promise<RiskThreshold> {
    const threshold = await this.thresholdRepo.findOne({ where: { id } });
    if (!threshold) {
      throw new NotFoundException(`Risk threshold ${id} not found`);
    }

    const changes: Record<string, { from: unknown; to: unknown }> = {};
    const apply = <K extends keyof RiskThreshold>(
      key: K,
      value: RiskThreshold[K] | undefined,
    ) => {
      if (value === undefined) return;
      if (threshold[key] !== value) {
        changes[key as string] = { from: threshold[key], to: value };
        threshold[key] = value;
      }
    };

    apply('name', dto.name as RiskThreshold['name']);
    apply('metricKey', dto.metricKey as RiskThreshold['metricKey']);
    apply('operator', dto.operator as RiskThreshold['operator']);
    if (dto.thresholdValue !== undefined) {
      apply('thresholdValue', toDecimalString4(dto.thresholdValue));
    }
    apply('severity', dto.severity as RiskThreshold['severity']);
    apply('description', dto.description as RiskThreshold['description']);
    apply('isActive', dto.isActive as RiskThreshold['isActive']);

    const saved = await this.thresholdRepo.save(threshold);

    await this.auditService.log({
      actorId,
      action: 'RISK_THRESHOLD_UPDATED',
      entityType: 'RiskThreshold',
      entityId: saved.id,
      metadata: { changes },
    });

    return saved;
  }

  /**
   * Soft-delete: flip `isActive` to false. We keep the row so historical
   * alerts retain their context (severity label, threshold value, etc.).
   * Calling delete on an already-inactive threshold is a no-op success.
   */
  async deleteThreshold(
    id: string,
    actorId: string | null,
  ): Promise<RiskThreshold> {
    const threshold = await this.thresholdRepo.findOne({ where: { id } });
    if (!threshold) {
      throw new NotFoundException(`Risk threshold ${id} not found`);
    }

    if (threshold.isActive) {
      threshold.isActive = false;
      await this.thresholdRepo.save(threshold);
    }

    await this.auditService.log({
      actorId,
      action: 'RISK_THRESHOLD_DELETED',
      entityType: 'RiskThreshold',
      entityId: threshold.id,
      metadata: { name: threshold.name, metricKey: threshold.metricKey },
    });

    return threshold;
  }

  // -------- Evaluation engine --------

  /**
   * Evaluate every active threshold against the current portfolio
   * snapshot. For each breach, append a new RiskAlert row. We do NOT
   * deduplicate against existing unresolved alerts — caller decides how
   * often to call this; each invocation produces a point-in-time record.
   *
   * Source of portfolio data: `InvestmentService.getSummary()` — single
   * boundary, computed in JS from the full investment row set.
   */
  async evaluateAllThresholds(
    actorId: string | null = null,
  ): Promise<EvaluationResult> {
    const summary = await this.investmentService.getSummary();
    const activeThresholds = await this.thresholdRepo.find({
      where: { isActive: true },
    });

    const triggeredAlerts: RiskAlert[] = [];

    for (const t of activeThresholds) {
      const actual = computeMetric(t.metricKey, summary);
      if (actual === null) {
        // Unknown metricKey — skip rather than throw, so one bad rule
        // can't poison the whole evaluation pass. Surfaced via audit.
        await this.auditService.log({
          actorId,
          action: 'RISK_THRESHOLD_SKIPPED_UNKNOWN_METRIC',
          entityType: 'RiskThreshold',
          entityId: t.id,
          metadata: { metricKey: t.metricKey },
        });
        continue;
      }

      const target = toNumber(t.thresholdValue);
      if (!isBreached(actual, t.operator, target)) continue;

      const unit = metricUnit(t.metricKey);
      const message =
        `[${t.severity.toUpperCase()}] ${t.name}: ` +
        `${t.metricKey} = ${actual.toFixed(2)}${unit} ${operatorLabel(t.operator)} ` +
        `${target.toFixed(2)}${unit} (threshold breached)`;

      const alert = this.alertRepo.create({
        thresholdId: t.id,
        triggeredValue: toDecimalString4(actual),
        message,
        severity: t.severity,
        isResolved: false,
      });
      const savedAlert = await this.alertRepo.save(alert);
      triggeredAlerts.push(savedAlert);

      await this.auditService.log({
        actorId,
        action: 'RISK_ALERT_TRIGGERED',
        entityType: 'RiskAlert',
        entityId: savedAlert.id,
        metadata: {
          thresholdId: t.id,
          thresholdName: t.name,
          metricKey: t.metricKey,
          actual,
          target,
          operator: t.operator,
          severity: t.severity,
        },
      });
    }

    await this.auditService.log({
      actorId,
      action: 'RISK_EVALUATION_RUN',
      entityType: 'RiskAlert',
      metadata: {
        evaluatedThresholds: activeThresholds.length,
        triggeredCount: triggeredAlerts.length,
        portfolioSnapshot: {
          totalCurrentValue: summary.totalCurrentValue,
          activeCount: summary.activeCount,
          allocationByType: summary.allocationByType,
        },
      },
    });

    return {
      evaluatedThresholds: activeThresholds.length,
      triggeredAlerts,
    };
  }

  // -------- Alerts --------

  async getAlerts(filters: AlertFilters = {}): Promise<PaginatedAlerts> {
    const page = Math.max(1, Math.floor(filters.page ?? 1));
    const limit = Math.max(1, Math.min(200, Math.floor(filters.limit ?? 50)));

    const qb = this.alertRepo
      .createQueryBuilder('a')
      .orderBy('a.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (filters.isResolved !== undefined) {
      qb.andWhere('a.isResolved = :isResolved', {
        isResolved: filters.isResolved,
      });
    }
    if (filters.severity) {
      qb.andWhere('a.severity = :severity', { severity: filters.severity });
    }
    if (filters.thresholdId) {
      qb.andWhere('a.thresholdId = :thresholdId', {
        thresholdId: filters.thresholdId,
      });
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

  async resolveAlert(
    id: string,
    actorId: string | null,
  ): Promise<RiskAlert> {
    const alert = await this.alertRepo.findOne({ where: { id } });
    if (!alert) {
      throw new NotFoundException(`Risk alert ${id} not found`);
    }

    if (!alert.isResolved) {
      alert.isResolved = true;
      alert.resolvedAt = new Date();
      alert.resolvedBy = actorId;
      await this.alertRepo.save(alert);
    }

    await this.auditService.log({
      actorId,
      action: 'RISK_ALERT_RESOLVED',
      entityType: 'RiskAlert',
      entityId: alert.id,
      metadata: {
        thresholdId: alert.thresholdId,
        severity: alert.severity,
        triggeredValue: alert.triggeredValue,
      },
    });

    return alert;
  }
}
