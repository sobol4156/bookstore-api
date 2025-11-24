import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { GetBooksQueryDto } from './dto/get-books-query.dto';
import { Prisma } from '@prisma/client';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { RedisService } from '../redis/redis.service';
import config from '../../config';

@Injectable()
export class BooksService {
  constructor(
    private readonly dbService: DbService,
    private readonly redisService: RedisService,
  ) { }

  async getBooks(params: GetBooksQueryDto) {
    const cacheKey = `books:${JSON.stringify({
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      authorId: params.authorId,
      categoryId: params.categoryId,
      year: params.year,
      status: params.status,
      search: params.search,
    })}`;

    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return cached;
    }

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

    const result = await this.dbService.book.findMany({
      where,
      skip,
      take,
      include: {
        author: true,
        category: true,
      },
    });

    await this.redisService.set(cacheKey, result, config.REDIS_TTL);

    return result;
  }

  async getBookById(id: string) {
    const cacheKey = `book:${id}`;

    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const book = await this.dbService.book.findUnique({
      where: { id },
      include: {
        author: true,
        category: true,
        orders: true,
        rentals: true,
      },
    });

    if (book) {
      await this.redisService.set(cacheKey, book, 600);
    }

    return book;
  }

  async createBook(dto: CreateBookDto) {
    const book = await this.dbService.book.create({
      data: dto,
    });

    await this.redisService.delPattern('books:*');

    return book;
  }

  async updateBook(id: string, dto: UpdateBookDto) {

    const existingBook = await this.dbService.book.findUnique({
      where: { id },
    });

    if (!existingBook) {
      throw new NotFoundException('Book not found');
    }

    if (dto.authorId) {
      const author = await this.dbService.author.findUnique({
        where: { id: dto.authorId },
      });
      if (!author) {
        throw new NotFoundException('Author not found');
      }
    }

    if (dto.categoryId) {
      const category = await this.dbService.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    try {
      const book = await this.dbService.book.update({
        where: { id },
        data: dto,
      });

      await this.redisService.del(`book:${id}`);
      await this.redisService.delPattern('books:*');

      return book;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Book with ID ${id} not found`);
      }
      throw error
    }
  }

  async deleteBook(id: string) {
    const book = await this.dbService.book.findUnique({
      where: { id },
      include: {
        rentals: {
          where: { isActive: true },
        },
        orders: true,
      },
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    if (book.rentals && book.rentals.length > 0) {
      throw new ConflictException(
        `Cannot delete book: it has ${book.rentals.length} active rental(s)`
      );
    }

    const activeRentalOrders = book.orders.filter(
      order => order.type === 'RENTAL'
    );

    if (activeRentalOrders.length > 0) {
      const rentalOrderIds = activeRentalOrders.map(o => o.id);
      const activeRentalsForOrders = await this.dbService.rental.findMany({
        where: {
          orderId: { in: rentalOrderIds },
          isActive: true,
        },
      });

      if (activeRentalsForOrders.length > 0) {
        throw new ConflictException(
          `Cannot delete book: it has active rental orders`
        );
      }
    }

    try {
      const book = await this.dbService.book.delete({
        where: { id },
      });

      await this.redisService.del(`book:${id}`);
      await this.redisService.delPattern('books:*');

      return book;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Book with ID ${id} not found`);
      }
      throw error
    }
  }
}
