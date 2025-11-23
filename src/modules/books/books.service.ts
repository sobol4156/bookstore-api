import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { GetBooksQueryDto } from './dto/get-books-query.dto';
import { Prisma } from '@prisma/client';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

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

  async updateBook(id: string, dto: UpdateBookDto) {

    const existingBook = await this.dbService.book.findUnique({
      where: { id },
    });

    if (!existingBook) {
      throw new NotFoundException('Book not found');
    }

    if(dto.authorId) {
      const author = await this.dbService.author.findUnique({
        where: { id: dto.authorId },
      });
      if (!author) {
        throw new NotFoundException('Author not found');
      }
    }

    if(dto.categoryId) {
      const category = await this.dbService.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }
    
    try {
      return this.dbService.book.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Book with ID ${id} not found`);
      }
      throw error
    }
  }
}
