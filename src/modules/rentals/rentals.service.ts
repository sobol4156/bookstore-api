import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { BookStatus, Prisma } from '@prisma/client';
import { DbService } from '../db/db.service';
import { RedisService } from '../redis/redis.service';
import { GetRentalsQueryDto } from './dto/get-rentals-query.dto';

@Injectable()
export class RentalsService {
  constructor(
    private readonly dbService: DbService,
    private readonly redisService: RedisService,
  ) { }

  async getRentals(userId: string, query: GetRentalsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const where: Prisma.RentalWhereInput = { userId };
    if (typeof query.isActive === 'boolean') {
      where.isActive = query.isActive;
    }

    const [rentals, total] = await Promise.all([
      this.dbService.rental.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { startAt: 'desc' },
        include: this.getRentalInclude(),
      }),
      this.dbService.rental.count({ where }),
    ]);

    return {
      data: rentals,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getRentalById(userId: string, rentalId: string) {
    const rental = await this.dbService.rental.findFirst({
      where: { id: rentalId, userId },
      include: this.getRentalInclude(),
    });

    if (!rental) {
      throw new NotFoundException(`Rental with ID ${rentalId} not found`);
    }

    return rental;
  }

  async returnRental(userId: string, rentalId: string) {
    const rental = await this.dbService.rental.findFirst({
      where: { id: rentalId, userId },
      include: {
        book: {
          select: { id: true, status: true },
        },
      },
    });

    if (!rental) {
      throw new NotFoundException(`Rental with ID ${rentalId} not found`);
    }

    if (!rental.isActive) {
      throw new ConflictException('Rental is already returned');
    }

    const updatedRental = await this.dbService.$transaction(async (tx) => {
      await tx.book.update({
        where: { id: rental.bookId },
        data: {
          status: BookStatus.AVAILABLE,
          available: true,
        },
      });

      return tx.rental.update({
        where: { id: rental.id },
        data: {
          isActive: false,
        },
        include: this.getRentalInclude(),
      });
    });

    await this.redisService.del(`book:${rental.bookId}`);
    await this.redisService.delPattern('books:*');

    return updatedRental;
  }

  private getRentalInclude(): Prisma.RentalInclude {
    return {
      book: {
        select: {
          id: true,
          title: true,
          status: true,
          available: true,
          authorId: true,
          categoryId: true,
          coverUrl: true,
        },
      },
      order: {
        select: {
          id: true,
          type: true,
          createdAt: true,
        },
      },
    };
  }
}

