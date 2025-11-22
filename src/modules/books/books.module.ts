import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { DbModule } from '../db/db.module';

@Module({
  controllers: [BooksController],
  imports: [DbModule],
  providers: [BooksService]
})
export class BooksModule {}
