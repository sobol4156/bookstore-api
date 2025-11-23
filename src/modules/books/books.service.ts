import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { GetBooksQueryDto } from './dto/get-books-query.dto';
import { Prisma } from '@prisma/client';
import { CreateBookDto } from './dto/create-book.dto';

@Injectable()
export class BooksService {
  constructor(private readonly dbService: DbService) { }

  async getBooks(params: GetBooksQueryDto){

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

    const skip = ((params.page ?? 1) - 1) * (params.limit ?? 10);
    const take = params.limit ?? 10;

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

  async getBookById(id: string) {
    return this.dbService.book.findUnique({
      where: { id },
      include: {
        author: true,
        category: true,
        orders: true,
        rentals: true,
      },
    });
  }

  async createBook(dto: CreateBookDto) {
    return this.dbService.book.create({
      data: dto,
    });
  }
}
