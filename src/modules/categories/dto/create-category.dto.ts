import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Fantasy',
    minLength: 2,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  name: string;

}

