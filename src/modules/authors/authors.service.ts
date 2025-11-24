import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { GetAuthorsQueryDto } from './dto/get-authors-query.dto';
import { Prisma } from '@prisma/client';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';

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

  async getAuthorById(id: string) {
    const author = await this.dbService.author.findUnique({
      where: { id },
      include: {
        books: {
          select: {
            id: true,
            title: true,
            description: true,
            year: true,
            priceCents: true,
            rentPriceCents: true,
            status: true,
            coverUrl: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            books: true,
          },
        },
      },
    });

    if (!author) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }

    return author
  }

  async createAuthor(dto: CreateAuthorDto) {
    const existingAuthor = await this.dbService.author.findFirst({
      where: {
        name: {
          equals: dto.name.trim(),
          mode: 'insensitive'
        },
      },
    });

    if (existingAuthor) {
      throw new ConflictException(`Author with name "${dto.name}" already exists`);
    }

    try {
      return await this.dbService.author.create({
        data: {
          name: dto.name.trim(),
          bio: dto.bio?.trim() || null,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Author with this name already exists');
      }
      throw error;
    }
  }

  async updateAuthor(id: string, dto: UpdateAuthorDto) {
    const existingAuthor = await this.dbService.author.findUnique({
      where: { id },
    });

    if (!existingAuthor) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }

    if (dto.name) {
      const duplicateAuthor = await this.dbService.author.findFirst({
        where: {
          name: {
            equals: dto.name.trim(),
            mode: 'insensitive',
          },
          id: {
            not: id,
          },
        },
      });

      if (duplicateAuthor) {
        throw new ConflictException(`Author with name "${dto.name}" already exists`);
      }
    }

    try {
      const updateData: Prisma.AuthorUpdateInput = {};

      if (dto.name !== undefined) {
        updateData.name = dto.name.trim();
      }

      if (dto.bio !== undefined) {
        updateData.bio = dto.bio?.trim() || null;
      }

      return await this.dbService.author.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Author with ID ${id} not found`);
      }
      if (error.code === 'P2002') {
        throw new ConflictException('Author with this name already exists');
      }
      throw error;
    }
  }

  async deleteAuthor(id: string) {
    const author = await this.dbService.author.findUnique({
      where: { id },
      include: {
        books: true,
      },
    });

    if (!author) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }

    if (author.books && author.books.length > 0) {
      throw new ConflictException(
        `Cannot delete author: author has ${author.books.length} book(s). Please delete or reassign books first.`
      );
    }

    try {
      return await this.dbService.author.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Author with ID ${id} not found`);
      }
      throw error;
    }
  }
}
