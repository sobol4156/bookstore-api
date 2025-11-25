import {
  Controller,
  Get,
  Param,
  Patch,
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
import { NotificationsService } from './notifications.service';
import { GetNotificationsQueryDto } from './dto/get-notifications-query.dto';

type AuthenticatedRequest = RequestExp & { user: { userId: string } };

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiCookieAuth('access_token')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @Get()
  @ApiOperation({
    summary: 'Get notifications for the current user',
    description: 'Returns a paginated list of notifications with optional filtering by read status.',
  })
  @ApiResponse({
    status: 200,
    description: 'Notifications successfully retrieved',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              message: { type: 'string' },
              read: { type: 'boolean' },
              sentAt: { type: 'string', format: 'date-time', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            total: { type: 'number', example: 20 },
            totalPages: { type: 'number', example: 2 },
          },
        },
      },
    },
  })
  async getNotifications(@Request() req: RequestExp, @Query() query: GetNotificationsQueryDto) {
    const { user } = req as AuthenticatedRequest;
    if (!user?.userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.notificationsService.getNotifications(user.userId, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get notification by ID',
    description: 'Returns notification details if it belongs to the authenticated user.',
  })
  @ApiParam({
    name: 'id',
    description: 'Notification UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification found',
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found or does not belong to the user',
  })
  async getNotificationById(@Request() req: RequestExp, @Param('id') id: string) {
    const { user } = req as AuthenticatedRequest;
    if (!user?.userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.notificationsService.getNotificationById(user.userId, id);
  }

  @Patch(':id/read')
  @ApiOperation({
    summary: 'Mark notification as read',
    description: 'Marks a single notification as read for the authenticated user.',
  })
  @ApiParam({
    name: 'id',
    description: 'Notification UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read',
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found or does not belong to the user',
  })
  async markAsRead(@Request() req: RequestExp, @Param('id') id: string) {
    const { user } = req as AuthenticatedRequest;
    if (!user?.userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.notificationsService.markAsRead(user.userId, id);
  }

  @Patch('read-all')
  @ApiOperation({
    summary: 'Mark all notifications as read',
    description: 'Marks every unread notification for the authenticated user as read.',
  })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read (returns number of updated rows)',
  })
  async markAllAsRead(@Request() req: RequestExp) {
    const { user } = req as AuthenticatedRequest;
    if (!user?.userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.notificationsService.markAllAsRead(user.userId);
  }
}

