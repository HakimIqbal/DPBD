import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { ProgramStatus } from '../../entities';

export class CreateProgramDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsNumber()
  targetAmount?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;
}

export class UpdateProgramDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsNumber()
  targetAmount?: number;

  @IsOptional()
  @IsNumber()
  collectedAmount?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(['draft', 'active', 'completed', 'archived'])
  status?: ProgramStatus;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;
}
