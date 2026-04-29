import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import type { InstrumentType, InvestmentStatus } from '../../entities';

const INSTRUMENT_TYPES: InstrumentType[] = [
  'reksa_dana',
  'sukuk',
  'deposito_syariah',
  'saham_syariah',
];

const INVESTMENT_STATUSES: InvestmentStatus[] = [
  'active',
  'matured',
  'liquidated',
];

/**
 * Body for `PATCH /api/investments/:id`. Every field is optional; only the
 * provided keys are applied. We don't reuse `PartialType` from
 * `@nestjs/mapped-types` to avoid adding a dependency for a single DTO.
 *
 * `currentValue` and `actualReturnAmount` are intentionally exposed here
 * so the same endpoint can be used for manual mark-to-market corrections.
 * For day-to-day cash events, prefer `POST /investments/:id/transactions`
 * which keeps an audit-friendly journal entry.
 */
export class UpdateInvestmentDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsEnum(INSTRUMENT_TYPES)
  instrumentType?: InstrumentType;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  institution?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  principalAmount?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  currentValue?: number;

  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @IsOptional()
  @IsDateString()
  maturityDate?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  expectedReturnRate?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  actualReturnAmount?: number;

  @IsOptional()
  @IsEnum(INVESTMENT_STATUSES)
  status?: InvestmentStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
