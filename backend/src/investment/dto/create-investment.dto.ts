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
import type { InstrumentType } from '../../entities';

const INSTRUMENT_TYPES: InstrumentType[] = [
  'reksa_dana',
  'sukuk',
  'deposito_syariah',
  'saham_syariah',
];

/**
 * Body for `POST /api/investments`. Money fields are accepted as JS numbers
 * for ergonomics — the service rounds them to 2 decimal places before
 * persisting (the entity column is decimal(18,2) and stored as string).
 *
 * IDR amounts comfortably fit in JS Number's safe-integer range
 * (Number.MAX_SAFE_INTEGER ≈ 9 quadrillion).
 */
export class CreateInvestmentDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsEnum(INSTRUMENT_TYPES, {
    message: `instrumentType must be one of: ${INSTRUMENT_TYPES.join(', ')}`,
  })
  instrumentType: InstrumentType;

  @IsString()
  @MaxLength(255)
  institution: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  principalAmount: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  currentValue: number;

  /** ISO date 'YYYY-MM-DD' (or full ISO timestamp; only the date part is stored). */
  @IsDateString()
  purchaseDate: string;

  @IsOptional()
  @IsDateString()
  maturityDate?: string;

  /** % per annum, 0–100 with 2 decimal places. Optional for equity-style instruments. */
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  expectedReturnRate?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
