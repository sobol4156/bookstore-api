import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderType, RentalDuration } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsUUID, ValidateIf } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Book identifier the order is created for',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  bookId: string;

  @ApiProperty({
    description: 'Order type: purchase or rental',
    enum: OrderType,
    example: OrderType.PURCHASE,
  })
  @IsEnum(OrderType)
  type: OrderType;

  @ApiPropertyOptional({
    description: 'Rental duration. Required only for rental orders.',
    enum: RentalDuration,
    example: RentalDuration.ONE_MONTH,
  })
  @ValidateIf((dto) => dto.type === OrderType.RENTAL)
  @IsEnum(RentalDuration, {
    message: 'duration must be a valid RentalDuration enum value',
  })
  duration?: RentalDuration;
}


