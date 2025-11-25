import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { GetCategoriesQueryDto } from './dto/get-categories-query.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) { }

  @Get()
  @ApiOperation({
    summary: 'Get all categories',
    description: 'Returns a paginated list of categories with optional search by name.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of categories successfully retrieved',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
              name: { type: 'string', example: 'Fantasy' },
              createdAt: { type: 'string', format: 'date-time' },
              _count: {
                type: 'object',
                properties: {
                  books: { type: 'number', example: 42 },
                },
              },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            total: { type: 'number', example: 100 },
            totalPages: { type: 'number', example: 10 },
          },
        },
      },
    },
  })
  async getCategories(@Query() query: GetCategoriesQueryDto) {
    return this.categoriesService.getCategories(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get category by ID',
    description: 'Returns category details including related books.',
  })
  @ApiParam({
    name: 'id',
    description: 'Category UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Category found',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async getCategoryById(@Param('id') id: string) {
    return this.categoriesService.getCategoryById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Create a new category',
    description: 'Creates a new category in the system. ADMIN role required.',
  })
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({
    status: 201,
    description: 'Category successfully created',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions (ADMIN role required)',
  })
  @ApiResponse({
    status: 409,
    description: 'Category with this name already exists',
  })
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.createCategory(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Update a category',
    description: 'Updates an existing category. ADMIN role required.',
  })
  @ApiParam({
    name: 'id',
    description: 'Category UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({
    status: 200,
    description: 'Category successfully updated',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions (ADMIN role required)',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Category with this name already exists',
  })
  async updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.updateCategory(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Delete a category',
    description: 'Deletes a category from the system. ADMIN role required. Cannot delete if category has books.',
  })
  @ApiParam({
    name: 'id',
    description: 'Category UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiResponse({
    status: 200,
    description: 'Category successfully deleted',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions (ADMIN role required)',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Cannot delete category: it has books',
  })
  async deleteCategory(@Param('id') id: string) {
    return this.categoriesService.deleteCategory(id);
  }
}

