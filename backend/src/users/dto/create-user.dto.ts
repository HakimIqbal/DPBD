import { IsEmail, IsString, IsOptional, IsEnum } from 'class-validator';
import type { UserRole, UserStatus } from '../../entities';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsEnum(['admin', 'editor', 'finance', 'personal', 'company'])
  role: UserRole;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  country?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsEnum(['active', 'suspended', 'deleted'])
  status?: UserStatus;
}
