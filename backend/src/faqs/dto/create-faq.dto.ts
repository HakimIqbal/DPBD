import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateFaqDto {
  @IsString()
  question: string;

  @IsString()
  answer: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateFaqDto {
  @IsOptional()
  @IsString()
  question?: string;

  @IsOptional()
  @IsString()
  answer?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
