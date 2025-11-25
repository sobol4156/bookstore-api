import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BookStatus,
  OrderType,
  Prisma,
  RentalDuration,
} from '@prisma/client';
import { DbService } from '../db/db.service';
import { RedisService } from '../redis/redis.service';
import { GetOrdersQueryDto } from './dto/get-orders-query.dto';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly dbService: DbService,
    private readonly redisService: RedisService,
  ) { }

  async getOrders(userId: string, query: GetOrdersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const where: Prisma.OrderWhereInput = { userId };
    if (query.type) {
      where.type = query.type;
    }

    const [orders, total] = await Promise.all([
      this.dbService.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: this.getOrderInclude(),
      }),
      this.dbService.order.count({ where }),
    ]);

    return {
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOrderById(userId: string, orderId: string) {
    const order = await this.dbService.order.findFirst({
      where: { id: orderId, userId },
      include: this.getOrderInclude(),
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return order;
  }

  async createOrder(userId: string, dto: CreateOrderDto) {
    if (dto.type === OrderType.RENTAL && !dto.duration) {
      throw new BadRequestException('Rental duration is required for rental orders');
    }

    const book = await this.dbService.book.findUnique({
      where: { id: dto.bookId },
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${dto.bookId} not found`);
    }

    if (!book.available || book.status !== BookStatus.AVAILABLE) {
      throw new ConflictException('Book is not available for ordering');
    }

    const order = await this.dbService.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          userId,
          bookId: book.id,
          type: dto.type,
        },
      });

      if (dto.type === OrderType.RENTAL) {
        const duration = dto.duration as RentalDuration;
        const { startAt, endAt, autoReminderAt } = this.calculateRentalDates(duration);

        await tx.rental.create({
          data: {
            orderId: createdOrder.id,
            userId,
            bookId: book.id,
            duration,
            startAt,
            endAt,
            autoReminderAt,
          },
        });

        await tx.book.update({
          where: { id: book.id },
          data: {
            status: BookStatus.RENTED,
            available: false,
          },
        });
      } else {
        await tx.book.update({
          where: { id: book.id },
          data: {
            status: BookStatus.SOLD,
            available: false,
          },
        });
      }

      return tx.order.findUnique({
        where: { id: createdOrder.id },
        include: this.getOrderInclude(),
      });
    });

    if (!order) {
      throw new NotFoundException('Failed to fetch order after creation');
    }

    await this.redisService.del(`book:${book.id}`);
    await this.redisService.delPattern('books:*');

    return order;
  }

  private getOrderInclude(): Prisma.OrderInclude {
    return {
      book: {
        select: {
          id: true,
          title: true,
          authorId: true,
          categoryId: true,
          coverUrl: true,
          status: true,
          available: true,
          priceCents: true,
          rentPriceCents: true,
        },
      },
      rental: true,
    };
  }

  private calculateRentalDates(duration: RentalDuration) {
    const startAt = new Date();
    const endAt = new Date(startAt);

    switch (duration) {
      case RentalDuration.TWO_WEEKS:
        endAt.setDate(endAt.getDate() + 14);
        break;
      case RentalDuration.ONE_MONTH:
        endAt.setMonth(endAt.getMonth() + 1);
        break;
      case RentalDuration.THREE_MONTHS:
        endAt.setMonth(endAt.getMonth() + 3);
        break;
      default:
        throw new BadRequestException(`Unsupported rental duration: ${duration as string}`);
    }

    const autoReminderAt = new Date(endAt);
    autoReminderAt.setDate(autoReminderAt.getDate() - 2);

    return { startAt, endAt, autoReminderAt };
  }
}


