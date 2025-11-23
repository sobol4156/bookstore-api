import { Module } from '@nestjs/common';
import { AuthorController } from './authors.controller';
import { AuthorService } from './authors.service';
import { DbModule } from '../db/db.module';

@Module({
  controllers: [AuthorController],
  imports: [DbModule],
  providers: [AuthorService]
})
export class AuthorModule { }
