import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MinLength, MaxLength } from "class-validator";

export class CreateAuthorDto {
  @ApiProperty({
    description: 'Author name',
    example: 'J.K. Rowling',
    minLength: 2,
    maxLength: 255
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Author biography',
    example: 'British author, best known for the Harry Potter series'
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  bio?: string;
}