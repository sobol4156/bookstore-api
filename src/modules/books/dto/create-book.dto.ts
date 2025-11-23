import { BookStatus } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsString, IsNumber, IsEnum, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { IsOptional } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  @Transform(({ value }) => value.trim())
  title: string;
  @IsString()
  @Transform(({ value }) => value.trim())
  description: string;
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  authorId: string;
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  categoryId: string;
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  year: number;
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  priceCents: number;
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  rentPriceCents: number;
  @IsEnum(BookStatus)
  @Transform(({ value }) => value as BookStatus)
  @IsNotEmpty()
  status: BookStatus;
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim() || null)
  coverUrl?: string;
}