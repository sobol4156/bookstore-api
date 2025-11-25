import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    description: 'Category name',
    example: 'Fantasy',
    minLength: 2,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  name?: string;
}

