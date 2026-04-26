import { IsArray, IsString, IsOptional } from 'class-validator';

export class BulkApproveDto {
  @IsArray()
  donationIds: string[];
}

export class BulkRejectDto {
  @IsArray()
  donationIds: string[];

  @IsOptional()
  @IsString()
  reason?: string;
}

export class BulkRefundDto {
  @IsArray()
  donationIds: string[];

  @IsOptional()
  @IsString()
  reason?: string;
}

export class BulkStatusUpdateDto {
  @IsArray()
  donationIds: string[];

  @IsString()
  status: 'pending' | 'completed' | 'failed' | 'refunded';
}
