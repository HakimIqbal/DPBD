import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import type { InvestmentTransactionType } from '../../entities';

const TRANSACTION_TYPES: InvestmentTransactionType[] = [
  'purchase',
  'return_received',
  'partial_liquidation',
  'full_liquidation',
  'value_update',
];

/**
 * Body for `POST /api/investments/:id/transactions`. The combination of
 * `transactionType` + `amount` drives the side-effects on the parent
 * investment row — see InvestmentService.addTransaction for the exact
 * mapping (value_update → currentValue, return_received → cumulative
 * return, full_liquidation → status).
 */
export class AddTransactionDto {
  @IsEnum(TRANSACTION_TYPES, {
    message: `transactionType must be one of: ${TRANSACTION_TYPES.join(', ')}`,
  })
  transactionType: InvestmentTransactionType;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount: number;

  @IsDateString()
  transactionDate: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
