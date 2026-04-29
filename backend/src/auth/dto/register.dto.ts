import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import type { UserRole } from '../../entities';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  name: string;

  @IsEnum(['personal', 'company'])
  role: UserRole;

  @IsOptional()
  @IsString()
  country?: string;

  // Company-specific fields (optional for personal users)
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  npwp?: string;

  @IsOptional()
  @IsString()
  picName?: string;

  @IsOptional()
  @IsString()
  companyAddress?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  companyCountry?: string;

  @IsOptional()
  @IsString()
  industry?: string;
}
