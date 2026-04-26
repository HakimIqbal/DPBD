import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsEnum,
} from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  programId: string;

  @IsNumber()
  amount: number;

  @IsEnum(['va', 'qris', 'ewallet', 'cc'])
  paymentMethod: 'va' | 'qris' | 'ewallet' | 'cc';

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean = false;

  @IsOptional()
  @IsString()
  donorName?: string;

  @IsOptional()
  @IsString()
  donorEmail?: string;
}
