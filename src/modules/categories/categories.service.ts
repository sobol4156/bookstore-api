import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DbService } from '../db/db.service';
import { RedisService } from '../redis/redis.service';
import config from '../../config';
import { GetCategoriesQueryDto } from './dto/get-categories-query.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly dbService: DbService,
    private readonly redisService: RedisService,
  ) { }

  private buildCacheKey(prefix: string, payload: unknown) {
    return `${prefix}:${JSON.stringify(payload)}`;
  }

  async getCategories(query: GetCategoriesQueryDto) {
    const {  search } = query;
    const cacheKey = this.buildCacheKey('categories', {
      search
    });

    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const where: Prisma.CategoryWhereInput = {};

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const [categories, total] = await Promise.all([
      this.dbService.category.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { books: true } },
        },
      }),
      this.dbService.category.count({ where }),
    ]);

    const result = {
      data: categories,
      meta: {
        total
      },
    };

    await this.redisService.set(cacheKey, result, config.REDIS_TTL);

    return result;
  }

  async getCategoryById(id: string) {
    const cacheKey = `category:${id}`;

    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const category = await this.dbService.category.findUnique({
      where: { id },
      include: {
        books: {
          select: {
            id: true,
            title: true,
            description: true,
            authorId: true,
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

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    await this.redisService.set(cacheKey, category, 600);

    return category;
  }

  async createCategory(dto: CreateCategoryDto) {
    const existing = await this.dbService.category.findFirst({
      where: {
        name: {
          equals: dto.name.trim(),
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      throw new ConflictException(`Category with name "${dto.name}" already exists`);
    }

    const category = await this.dbService.category.create({
      data: {
        name: dto.name.trim(),
      },
    });

    await this.redisService.delPattern('categories:*');

    return category;
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    const category = await this.dbService.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    if (dto.name) {
      const duplicate = await this.dbService.category.findFirst({
        where: {
          name: {
            equals: dto.name.trim(),
            mode: 'insensitive',
          },
          id: { not: id },
        },
      });

      if (duplicate) {
        throw new ConflictException(`Category with name "${dto.name}" already exists`);
      }
    }

    const updateData: Prisma.CategoryUpdateInput = {};

    if (dto.name !== undefined) {
      updateData.name = dto.name.trim();
    }

    const updated = await this.dbService.category.update({
      where: { id },
      data: updateData,
    });

    await this.redisService.del(`category:${id}`);
    await this.redisService.delPattern('categories:*');

    return updated;
  }

  async deleteCategory(id: string) {
    const category = await this.dbService.category.findUnique({
      where: { id },
      include: {
        books: true,
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    if (category.books.length > 0) {
      throw new ConflictException(
        `Cannot delete category: it has ${category.books.length} book(s). Please reassign or delete books first.`,
      );
    }

    const deleted = await this.dbService.category.delete({
      where: { id },
    });

    await this.redisService.del(`category:${id}`);
    await this.redisService.delPattern('categories:*');

    return deleted;
  }
}

