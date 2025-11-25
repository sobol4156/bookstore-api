import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request as RequestExp } from 'express';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RentalsService } from './rentals.service';
import { GetRentalsQueryDto } from './dto/get-rentals-query.dto';

type AuthenticatedRequest = RequestExp & { user: { userId: string } };

@ApiTags('rentals')
@Controller('rentals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiCookieAuth('access_token')
export class RentalsController {
  constructor(private readonly rentalsService: RentalsService) { }

  @Get()
  @ApiOperation({
    summary: 'Get rentals for the current user',
    description: 'Returns a paginated list of rentals for the authenticated user with optional active filter.',
  })
  @ApiResponse({
    status: 200,
    description: 'Rentals successfully retrieved',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              startAt: { type: 'string', format: 'date-time' },
              endAt: { type: 'string', format: 'date-time' },
              isActive: { type: 'boolean' },
              duration: { type: 'string' },
              book: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  status: { type: 'string' },
                  coverUrl: { type: 'string', nullable: true },
                },
              },
              order: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  type: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            total: { type: 'number', example: 25 },
            totalPages: { type: 'number', example: 3 },
          },
        },
      },
    },
  })
  async getRentals(@Request() req: RequestExp, @Query() query: GetRentalsQueryDto) {
    const { user } = req as AuthenticatedRequest;
    if (!user?.userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.rentalsService.getRentals(user.userId, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get rental by ID',
    description: 'Returns rental details if it belongs to the authenticated user.',
  })
  @ApiParam({
    name: 'id',
    description: 'Rental UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Rental found',
  })
  @ApiResponse({
    status: 404,
    description: 'Rental not found or does not belong to the user',
  })
  async getRentalById(@Request() req: RequestExp, @Param('id') id: string) {
    const { user } = req as AuthenticatedRequest;
    if (!user?.userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.rentalsService.getRentalById(user.userId, id);
  }

  @Post(':id/return')
  @ApiOperation({
    summary: 'Return a rented book',
    description: 'Marks rental as returned and makes the book available again. Only active rentals can be returned.',
  })
  @ApiParam({
    name: 'id',
    description: 'Rental UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Rental successfully returned',
  })
  @ApiResponse({
    status: 404,
    description: 'Rental not found or does not belong to the user',
  })
  @ApiResponse({
    status: 409,
    description: 'Rental already returned',
  })
  async returnRental(@Request() req: RequestExp, @Param('id') id: string) {
    const { user } = req as AuthenticatedRequest;
    if (!user?.userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.rentalsService.returnRental(user.userId, id);
  }
}

