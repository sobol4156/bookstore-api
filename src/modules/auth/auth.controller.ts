import { Controller, Body, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { CreateUserDTO } from './dto/create-user.dto';

@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService) { }

  @Post('register')
  async register(@Body() dto: CreateUserDTO) {
    return this.authService.createUser(dto);
  }

}
