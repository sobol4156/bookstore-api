import { IsOptional, IsNumber, IsString, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { BookStatus } from "@prisma/client";
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetBooksQueryDto {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Author ID for filtering',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsOptional()
  @IsString()
  authorId?: string;

  @ApiPropertyOptional({
    description: 'Category ID for filtering',
    example: '550e8400-e29b-41d4-a716-446655440001'
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Publication year for filtering',
    example: 2020
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  year?: number;

  @ApiPropertyOptional({
    description: 'Book status',
    enum: BookStatus,
    example: BookStatus.AVAILABLE
  })
  @IsOptional()
  @IsEnum(BookStatus)
  status?: BookStatus;

  @ApiPropertyOptional({
    description: 'Search by book title (case-insensitive)',
    example: 'Harry Potter'
  })
  @IsOptional()
  @IsString()
  search?: string;
}