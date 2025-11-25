import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class GetCategoriesQueryDto {
  @ApiPropertyOptional({
    description: 'Search categories by name (case-insensitive)',
    example: 'Fantasy',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

