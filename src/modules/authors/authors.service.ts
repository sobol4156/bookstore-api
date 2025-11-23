import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { GetAuthorsQueryDto } from './dto/get-authors-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthorService {

  constructor(private readonly dbService: DbService) { }

  async getAuthors(query: GetAuthorsQueryDto) {
    const { page, limit, search, sortBy, sortOrder, includeBooks } = query;

    const skip = ((page ?? 1) - 1) * (limit ?? 10);
    const take = limit ?? 10;

    const where: Prisma.AuthorWhereInput = {};

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const orderBy: Prisma.AuthorOrderByWithRelationInput = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder ?? 'desc';
    }

    const include: Prisma.AuthorInclude = {
      _count: {
        select: {
          books: true,
        },
      },
    };

    if (includeBooks) {
      include.books = {
        select: {
          id: true,
          title: true,
          year: true,
          status: true,
          coverUrl: true,
        },
      };
    }

    const [authors, total] = await Promise.all([
      this.dbService.author.findMany({
        where,
        skip,
        take,
        orderBy,
        include,
      }),
      this.dbService.author.count({ where }),
    ]);

    return {
      data: authors,
      meta: {
        page: page ?? 1,
        limit: limit ?? 10,
        total,
        totalPages: Math.ceil(total / (limit ?? 10)),
      },
    };
  }
}
