import { IsString, IsOptional, IsUUID, IsBoolean } from 'class-validator';

export class CreateNewsDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsUUID()
  authorId: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateNewsDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
