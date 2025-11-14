import { Injectable, ConflictException } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { CreateUserDTO } from './dto/create-user.dto';
import bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  constructor(private dbService: DbService) { }

  async createUser(dto: CreateUserDTO) {
    const existing = await this.dbService.user.findUnique({
      where: { email: dto.email },
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
}
