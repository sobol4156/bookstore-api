import { Controller, Body, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { CreateUserDTO } from './dto/create-user.dto';
import type { Response } from 'express';


@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService) { }

  @Post('register')
  async register(@Body() dto: CreateUserDTO) {
    return this.authService.createUser(dto);
  }

  @Post('login')
  async login(@Body() dto: CreateUserDTO, @Res({ passthrough: true}) response: Response) {
    return this.authService.loginUser(dto, response);
  }
}
