import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MinLength, MaxLength } from "class-validator";
import { Transform } from "class-transformer";

export class UpdateAuthorDto {
  @ApiPropertyOptional({
    description: 'Author name',
    example: 'J.K. Rowling',
    minLength: 2,
    maxLength: 255
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiPropertyOptional({
    description: 'Author biography',
    example: 'British author, best known for the Harry Potter series'
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @Transform(({ value }) => value?.trim() || null)
  bio?: string;
}

