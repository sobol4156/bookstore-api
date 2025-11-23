import { BookStatus } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsString, IsNumber, IsEnum, IsNotEmpty, MaxLength, MinLength, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookDto {
  @ApiProperty({
    description: 'Book title',
    example: 'Harry Potter and the Philosopher\'s Stone',
    minLength: 3,
    maxLength: 255
  })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  @Transform(({ value }) => value.trim())
  title: string;

  @ApiProperty({
    description: 'Book description',
    example: 'A story about a young wizard who discovers his magical heritage'
  })
  @IsString()
  @Transform(({ value }) => value.trim())
  description: string;

  @ApiProperty({
    description: 'Author ID',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  authorId: string;

  @ApiProperty({
    description: 'Category ID',
    example: '550e8400-e29b-41d4-a716-446655440001'
  })
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({
    description: 'Publication year',
    example: 1997,
    minimum: 1000,
    maximum: 2100
  })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  year: number;

  @ApiProperty({
    description: 'Purchase price in cents',
    example: 2000,
    minimum: 0
  })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  priceCents: number;

  @ApiProperty({
    description: 'Rental price in cents',
    example: 500,
    minimum: 0
  })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  rentPriceCents: number;

  @ApiProperty({
    description: 'Book status',
    enum: BookStatus,
    example: BookStatus.AVAILABLE
  })
  @IsEnum(BookStatus)
  @Transform(({ value }) => value as BookStatus)
  @IsNotEmpty()
  status: BookStatus;

  @ApiPropertyOptional({
    description: 'Book cover image URL',
    example: 'https://example.com/cover.jpg',
    format: 'uri'
  })
  @IsString()
  @IsOptional()
  @IsUrl()
  @Transform(({ value }) => value?.trim() || null)
  coverUrl?: string;
}