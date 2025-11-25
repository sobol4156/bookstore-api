import {
  Body,
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
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request as RequestExp } from 'express';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { OrdersService } from './orders.service';
import { GetOrdersQueryDto } from './dto/get-orders-query.dto';
import { CreateOrderDto } from './dto/create-order.dto';

type AuthenticatedRequest = RequestExp & { user: { userId: string } };

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiCookieAuth('access_token')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Get()
  @ApiOperation({
    summary: 'Get orders for the current user',
    description: 'Returns paginated list of orders for the authenticated user with optional filtering by type.',
  })
  @ApiResponse({
    status: 200,
    description: 'Orders successfully retrieved',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              type: { type: 'string', enum: ['PURCHASE', 'RENTAL'] },
              createdAt: { type: 'string', format: 'date-time' },
              book: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  status: { type: 'string' },
                  coverUrl: { type: 'string', nullable: true },
                },
              },
              rental: {
                type: 'object',
                nullable: true,
              },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            total: { type: 'number', example: 42 },
            totalPages: { type: 'number', example: 5 },
          },
        },
      },
    },
  })
  async getOrders(@Request() req: RequestExp, @Query() query: GetOrdersQueryDto) {
    const { user } = req as AuthenticatedRequest;
    if (!user?.userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.ordersService.getOrders(user.userId, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get order by ID',
    description: 'Returns details of a single order that belongs to the authenticated user.',
  })
  @ApiParam({
    name: 'id',
    description: 'Order UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Order found',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found or does not belong to the user',
  })
  async getOrderById(@Request() req: RequestExp, @Param('id') id: string) {
    const { user } = req as AuthenticatedRequest;
    if (!user?.userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.ordersService.getOrderById(user.userId, id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new order',
    description: 'Creates a purchase or rental order for the authenticated user. Rental orders require a duration.',
  })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({
    status: 201,
    description: 'Order successfully created',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid payload or rental duration missing',
  })
  @ApiResponse({
    status: 404,
    description: 'Book not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Book is not available for ordering',
  })
  async createOrder(@Request() req: RequestExp, @Body() dto: CreateOrderDto) {
    const { user } = req as AuthenticatedRequest;
    if (!user?.userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.ordersService.createOrder(user.userId, dto);
  }
}


