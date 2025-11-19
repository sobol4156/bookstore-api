import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt'
import config from '../../config';
import type { Response } from 'express';
import type { User } from "@prisma/client"

@Injectable()
export class AuthService {
  constructor(
    private dbService: DbService,
    private jwtService: JwtService
  ) { }

  async validateUser(dto: CreateUserDTO): Promise<Omit<User, 'password'> | null> {
    const user = await this.dbService.user.findUnique({
      where: { email: dto.email }
    });
    if (user && await bcrypt.compare(dto.password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async createUser(dto: CreateUserDTO, response: Response) {
    const existing = await this.dbService.user.findUnique({
      where: { email: dto.email }
    });

    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    await this.dbService.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
      },
    });

    const user = await this.validateUser({ email: dto.email, password: dto.password });

    if (!user) {
      throw new UnauthorizedException('User email or password is invalid');
    }

    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    response.cookie('access_token', token, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: '/',
    });

    return { message: 'User successfully registered', user };
  }

  async loginUser(dto: CreateUserDTO, response: Response) {
    const user = await this.validateUser(dto);

    if (!user) {
      throw new UnauthorizedException('User email or password is invalid');
    }

    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    response.cookie('access_token', token, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: '/',
    });
    return { message: 'Logged in successfully' };
  }

  async logout(response: Response) {
    response.clearCookie('access_token', {
      sameSite: 'lax',
      httpOnly: true
    })

    return { message: 'Logged out successfully' }
  }
}
