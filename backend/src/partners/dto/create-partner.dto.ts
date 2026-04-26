import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreatePartnerDto {
  @IsString()
  name: string;

  @IsString()
  logo: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePartnerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
