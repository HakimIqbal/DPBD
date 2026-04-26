import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateDonorProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  zipCode?: string;
}

export class DonorPreferencesDto {
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  smsNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  monthlyReports?: boolean;

  @IsOptional()
  @IsBoolean()
  publicProfile?: boolean;

  @IsOptional()
  @IsBoolean()
  allowCommunications?: boolean;

  @IsOptional()
  @IsString()
  preferredLanguage?: 'id' | 'en';
}

export enum TierLevel {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
}

export class SearchDonorsDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsEnum(TierLevel)
  tier?: TierLevel;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
