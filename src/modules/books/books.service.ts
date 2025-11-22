import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import type { GetBooksQueryDtoDefault } from './dto/get-books-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BooksService {
  constructor(private readonly dbService: DbService) { }

  getBooks(params: GetBooksQueryDtoDefault){

    const where: Prisma.BookWhereInput = {};

    if (params.authorId) {
      where.authorId = params.authorId;
    }
    
    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }
    
    if (params.year) {
      where.year = params.year;
    }
    
    if (params.status) {
      where.status = params.status;
    }

    if (params.search) {
      where.title = {
        contains: params.search,
        mode: 'insensitive',
      };
    }

    const skip = (params.page - 1) * params.limit;
    const take = params.limit;

    return this.dbService.book.findMany({
      where,
      skip,
      take,
      include: {
        author: true,
        category: true,
      },
    });
  }
}
