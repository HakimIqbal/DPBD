import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { RiskOperator, RiskSeverity } from '../../entities';
import { RISK_METRIC_KEYS } from '../risk-metrics';

const OPERATORS: RiskOperator[] = ['greater_than', 'less_than', 'equals'];
const SEVERITIES: RiskSeverity[] = ['info', 'warning', 'critical'];

export class CreateThresholdDto {
  @IsString()
  @Length(1, 255)
  name: string;

  /**
   * Validated against the metric registry — anything not registered would
   * silently never trigger, which is worse than rejecting at the boundary.
   */
  @IsIn(RISK_METRIC_KEYS as readonly string[])
  metricKey: string;

  @IsEnum(OPERATORS)
  operator: RiskOperator;

  @Type(() => Number)
  @Min(0)
  @Max(1e15)
  thresholdValue: number;

  @IsEnum(SEVERITIES)
  severity: RiskSeverity;

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateThresholdDto {
  @IsOptional()
  @IsString()
  @Length(1, 255)
  name?: string;

  @IsOptional()
  @IsIn(RISK_METRIC_KEYS as readonly string[])
  metricKey?: string;

  @IsOptional()
  @IsEnum(OPERATORS)
  operator?: RiskOperator;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @Max(1e15)
  thresholdValue?: number;

  @IsOptional()
  @IsEnum(SEVERITIES)
  severity?: RiskSeverity;

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
