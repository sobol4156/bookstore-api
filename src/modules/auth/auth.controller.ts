import { JwtAuthGuard } from './jwt/jwt-auth.guard';
import { Controller, Body, Post, Res, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDTO } from './dto/create-user.dto';
import type { Request as RequestExp, Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiCookieAuth
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService) { }

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user and automatically logs in, setting JWT token in cookie'
  })
  @ApiBody({ type: CreateUserDTO })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User successfully registered' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string', nullable: true },
            role: { type: 'string', enum: ['USER', 'ADMIN'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists'
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data (invalid email or password too short)'
  })
  async register(@Body() dto: CreateUserDTO, @Res({ passthrough: true }) response: Response) {
    return this.authService.createUser(dto, response);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login to the system',
    description: 'Authenticates user and sets JWT token in cookie'
  })
  @ApiBody({ type: CreateUserDTO })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged in',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Logged in successfully' }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid email or password'
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data'
  })
  async login(@Body() dto: CreateUserDTO, @Res({ passthrough: true }) response: Response) {
    return this.authService.loginUser(dto, response);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOperation({
    summary: 'Logout from the system',
    description: 'Removes JWT token from cookie. Authentication required.'
  })
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiResponse({
    status: 200,
    description: 'Successfully logged out',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Logged out successfully' }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  async logout(@Res() response: Response) {
    return this.authService.logout(response);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({
    summary: 'Get current user information',
    description: 'Returns information about the currently authenticated user. Authentication required.'
  })
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiResponse({
    status: 200,
    description: 'User information',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
        email: { type: 'string', example: 'user@example.com' },
        role: { type: 'string', enum: ['USER', 'ADMIN'], example: 'USER' }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  async me(@Request() req: RequestExp) {
    return req.user;
  }
}
