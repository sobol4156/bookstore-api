import { Controller, Get, Query, Param, Body, Post, UseGuards, Patch } from '@nestjs/common';
import { BooksService } from './books.service';
import { GetBooksQueryDto } from './dto/get-books-query.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from '../auth/roles/roles.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiCookieAuth
} from '@nestjs/swagger';
import { UpdateBookDto } from './dto/update-book.dto';

@ApiTags('books')
@Controller('books')
export class BooksController {

  constructor(private readonly booksService: BooksService) { }

  @Get()
  @ApiOperation({
    summary: 'Get list of books',
    description: 'Returns a list of books with pagination, filtering, and search. Supports filtering by author, category, year, status, and search by title.'
  })
  @ApiResponse({
    status: 200,
    description: 'List of books successfully retrieved',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string', nullable: true },
              year: { type: 'number', nullable: true },
              priceCents: { type: 'number' },
              rentPriceCents: { type: 'number' },
              status: { type: 'string', enum: ['AVAILABLE', 'RENTED', 'SOLD', 'RESERVED', 'MAINTENANCE'] },
              coverUrl: { type: 'string', nullable: true },
              available: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              author: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  bio: { type: 'string', nullable: true }
                }
              },
              category: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' }
                }
              }
            }
          }
        },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            total: { type: 'number', example: 100 },
            totalPages: { type: 'number', example: 10 }
          }
        }
      }
    }
  })
  async getBooks(@Query() params: GetBooksQueryDto) {
    return this.booksService.getBooks(params);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get book by ID',
    description: 'Returns detailed information about a book by its identifier'
  })
  @ApiParam({
    name: 'id',
    description: 'Book UUID',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({
    status: 200,
    description: 'Book found',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string', nullable: true },
        year: { type: 'number', nullable: true },
        priceCents: { type: 'number' },
        rentPriceCents: { type: 'number' },
        status: { type: 'string' },
        coverUrl: { type: 'string', nullable: true },
        available: { type: 'boolean' },
        author: { type: 'object' },
        category: { type: 'object' },
        orders: { type: 'array' },
        rentals: { type: 'array' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Book not found'
  })
  async getBookById(@Param('id') id: string) {
    return this.booksService.getBookById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Create a new book',
    description: 'Creates a new book in the system. ADMIN role required.'
  })
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiResponse({
    status: 201,
    description: 'Book successfully created',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        authorId: { type: 'string' },
        categoryId: { type: 'string' },
        year: { type: 'number' },
        priceCents: { type: 'number' },
        rentPriceCents: { type: 'number' },
        status: { type: 'string' },
        coverUrl: { type: 'string', nullable: true },
        available: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data (validation failed)'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions (ADMIN role required)'
  })
  @ApiResponse({
    status: 404,
    description: 'Author or category not found'
  })
  async createBook(@Body() dto: CreateBookDto) {
    return this.booksService.createBook(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Update a book',
    description: 'Updates a book in the system. ADMIN role required. Only provided fields will be updated.'
  })
  @ApiParam({
    name: 'id',
    description: 'Book UUID',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiResponse({
    status: 200,
    description: 'Book successfully updated',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string', nullable: true },
        authorId: { type: 'string' },
        categoryId: { type: 'string' },
        year: { type: 'number', nullable: true },
        priceCents: { type: 'number' },
        rentPriceCents: { type: 'number' },
        status: { type: 'string' },
        coverUrl: { type: 'string', nullable: true },
        available: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data (validation failed)'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions (ADMIN role required)'
  })
  @ApiResponse({
    status: 404,
    description: 'Book not found'
  })
  async updateBook(@Param('id') id: string, @Body() dto: UpdateBookDto) {
    return this.booksService.updateBook(id, dto);
  }
}
