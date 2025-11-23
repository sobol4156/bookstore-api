import { BookStatus } from "@prisma/client";
import { Transform, Type } from "class-transformer";
import { IsString, IsNumber, IsEnum, IsNotEmpty, MaxLength, MinLength, IsOptional, IsUrl, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBookDto {
  @ApiPropertyOptional({
    description: 'Book title',
    example: 'Harry Potter and the Philosopher\'s Stone',
    minLength: 3,
    maxLength: 255
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  title?: string;

  @ApiPropertyOptional({
    description: 'Book description',
    example: 'A story about a young wizard who discovers his magical heritage'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiPropertyOptional({
    description: 'Author ID',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  authorId?: string;

  @ApiPropertyOptional({
    description: 'Category ID',
    example: '550e8400-e29b-41d4-a716-446655440001'
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Publication year',
    example: 1997,
    minimum: 1000,
    maximum: 2100
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1000)
  @Max(2100)
  year?: number;

  @ApiPropertyOptional({
    description: 'Purchase price in cents',
    example: 2000,
    minimum: 0
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceCents?: number;

  @ApiPropertyOptional({
    description: 'Rental price in cents',
    example: 500,
    minimum: 0
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  rentPriceCents?: number;

  @ApiPropertyOptional({
    description: 'Book status',
    enum: BookStatus,
    example: BookStatus.AVAILABLE
  })
  @IsOptional()
  @IsEnum(BookStatus)
  @Transform(({ value }) => value as BookStatus)
  status?: BookStatus;

  @ApiPropertyOptional({
    description: 'Book cover image URL',
    example: 'https://example.com/cover.jpg',
    format: 'uri'
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  @Transform(({ value }) => value?.trim() || null)
  coverUrl?: string;
}