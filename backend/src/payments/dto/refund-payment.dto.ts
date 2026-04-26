import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class RefundPaymentDto {
  @IsString()
  donationId: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  amount?: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
