import { Injectable, ConflictException } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt'
import config from '../../config';
import type { Response } from 'express';

interface User {
  id: number;
  email: string;
  name: string | null;
  password: string;
}

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

  async createUser(dto: CreateUserDTO) {
    const existing = await this.dbService.user.findUnique({
      where: { email: dto.email }
    });

    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = {
      data: {
        email: dto.email,
        password: hashedPassword,
      },
    }

    return this.dbService.user.create(newUser);
  }

  async loginUser(dto: CreateUserDTO, response: Response) {
    const user = await this.validateUser(dto);

    if (!user) {
      throw new Error('User email or password is invalid');
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
}
