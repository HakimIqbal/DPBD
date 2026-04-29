import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type RiskOperator = 'greater_than' | 'less_than' | 'equals';
export type RiskSeverity = 'info' | 'warning' | 'critical';

/**
 * A configurable risk rule. The Risk Manager defines a `metricKey` (e.g.
 * `sukuk_percentage`), an `operator`, and a `thresholdValue`; the
 * evaluation pipeline computes the metric from the current portfolio and
 * raises a `RiskAlert` row whenever the comparison evaluates to true.
 *
 * Soft-delete: we never DROP rows — `isActive=false` retires a rule
 * while keeping its alert history queryable for audit / compliance.
 */
@Entity('risk_thresholds')
export class RiskThreshold {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  /**
   * Stable identifier the evaluation engine maps to a numeric portfolio
   * metric. Keep in sync with `RISK_METRIC_KEYS` in risk.service.ts.
   */
  @Index('IDX_risk_thresholds_metric_key')
  @Column({ type: 'varchar', length: 64 })
  metricKey: string;

  @Column({
    type: 'enum',
    enum: ['greater_than', 'less_than', 'equals'],
  })
  operator: RiskOperator;

  /**
   * The numeric trigger. decimal(18,4) so a single column can carry both
   * percentages (e.g. 60.0000) and IDR exposure (e.g. 5000000000.0000).
   * Returned as a string by pg — convert at the math boundary.
   */
  @Column({ type: 'decimal', precision: 18, scale: 4 })
  thresholdValue: string;

  @Index('IDX_risk_thresholds_severity')
  @Column({
    type: 'enum',
    enum: ['info', 'warning', 'critical'],
  })
  severity: RiskSeverity;

  @Index('IDX_risk_thresholds_is_active')
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  /** FK to users(id), ON DELETE SET NULL — keep the rule if its author leaves. */
  @Column({ type: 'uuid', nullable: true })
  createdBy: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

/**
 * A breach event. Created by the evaluation engine when a threshold's
 * comparison is true against the current portfolio. Append-only by
 * convention — `resolveAlert` flips `isResolved` rather than deleting.
 */
@Entity('risk_alerts')
export class RiskAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** FK to risk_thresholds(id), ON DELETE CASCADE — alerts don't outlive their rule. */
  @Index('IDX_risk_alerts_threshold_id')
  @Column({ type: 'uuid' })
  thresholdId: string;

  /** The actual portfolio value at evaluation time that caused the breach. */
  @Column({ type: 'decimal', precision: 18, scale: 4 })
  triggeredValue: string;

  @Column({ type: 'varchar', length: 512 })
  message: string;

  @Index('IDX_risk_alerts_severity')
  @Column({
    type: 'enum',
    enum: ['info', 'warning', 'critical'],
  })
  severity: RiskSeverity;

  @Index('IDX_risk_alerts_is_resolved')
  @Column({ type: 'boolean', default: false })
  isResolved: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  resolvedAt: Date | null;

  /** FK to users(id), ON DELETE SET NULL. */
  @Column({ type: 'uuid', nullable: true })
  resolvedBy: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
