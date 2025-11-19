import { JwtAuthGuard } from './jwt-auth.guard';
import { Controller, Body, Post, Res, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { CreateUserDTO } from './dto/create-user.dto';
import type { Request as RequestExp, Response } from 'express';


@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService) { }

  @Post('register')
  async register(@Body() dto: CreateUserDTO, @Res({ passthrough: true }) response: Response) {
    return this.authService.createUser(dto, response);
  }

  @Post('login')
  async login(@Body() dto: CreateUserDTO, @Res({ passthrough: true }) response: Response) {
    return this.authService.loginUser(dto, response);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Request() req: RequestExp) {
    return req.user;
  }
}
