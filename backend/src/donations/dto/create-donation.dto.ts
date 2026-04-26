import {
  IsUUID,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsString,
  IsOptional,
  Min,
} from 'class-validator';
import type { DonationStatus, PaymentMethod } from '../../entities';

export class CreateDonationDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  programId: string;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsEnum(['virtual_account', 'qris', 'credit_card', 'bank_transfer'])
  paymentMethod: PaymentMethod;

  @IsBoolean()
  isAnonymous: boolean;

  @IsOptional()
  @IsString()
  proofUrl?: string;

  @IsOptional()
  @IsString()
  externalId?: string;
}

export class UpdateDonationDto {
  @IsOptional()
  @IsEnum(['pending', 'completed', 'failed', 'refunded'])
  status?: DonationStatus;

  @IsOptional()
  @IsString()
  proofUrl?: string;

  @IsOptional()
  @IsString()
  failureReason?: string;
}
