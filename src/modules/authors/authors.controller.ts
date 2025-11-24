import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiCookieAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthorService } from './authors.service';
import { GetAuthorsQueryDto } from './dto/get-authors-query.dto';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { Role } from '@prisma/client';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';

@ApiTags('authors')
@Controller('authors')
export class AuthorController {

  constructor(private readonly authorService: AuthorService) { }

  @Get()
  @ApiOperation({
    summary: 'Get all authors',
    description: 'Returns a paginated list of authors with optional filtering, search, and sorting. Can include books in response.'
  })
  @ApiResponse({
    status: 200,
    description: 'List of authors successfully retrieved',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                example: '550e8400-e29b-41d4-a716-446655440000',
                description: 'Author UUID'
              },
              name: {
                type: 'string',
                example: 'J.K. Rowling',
                description: 'Author name'
              },
              bio: {
                type: 'string',
                nullable: true,
                example: 'British author, best known for the Harry Potter series',
                description: 'Author biography'
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
                example: '2024-01-01T00:00:00.000Z',
                description: 'Creation timestamp'
              },
              books: {
                type: 'array',
                description: 'List of books by this author (only if includeBooks=true)',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    title: { type: 'string' },
                    year: { type: 'number', nullable: true },
                    status: { type: 'string' },
                    coverUrl: { type: 'string', nullable: true }
                  }
                }
              },
              _count: {
                type: 'object',
                description: 'Count of related books',
                properties: {
                  books: { type: 'number', example: 7 }
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
            total: { type: 'number', example: 50 },
            totalPages: { type: 'number', example: 5 }
          }
        }
      }
    }
  })
  async getAuthors(@Query() query: GetAuthorsQueryDto) {
    return this.authorService.getAuthors(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get author by ID',
    description: 'Returns detailed information about an author including all their books'
  })
  @ApiParam({
    name: 'id',
    description: 'Author UUID',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({
    status: 200,
    description: 'Author found',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          example: '550e8400-e29b-41d4-a716-446655440000'
        },
        name: {
          type: 'string',
          example: 'J.K. Rowling'
        },
        bio: {
          type: 'string',
          nullable: true,
          example: 'British author, best known for the Harry Potter series'
        },
        createdAt: {
          type: 'string',
          format: 'date-time'
        },
        books: {
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
              status: { type: 'string' },
              coverUrl: { type: 'string', nullable: true }
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Author not found'
  })
  async getAuthorById(@Param('id') id: string) {
    return this.authorService.getAuthorById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Create a new author',
    description: 'Creates a new author in the system. ADMIN role required.'
  })
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiBody({ type: CreateAuthorDto })
  @ApiResponse({
    status: 201,
    description: 'Author successfully created',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          example: '550e8400-e29b-41d4-a716-446655440000'
        },
        name: {
          type: 'string',
          example: 'J.K. Rowling'
        },
        bio: {
          type: 'string',
          nullable: true,
          example: 'British author, best known for the Harry Potter series'
        },
        createdAt: {
          type: 'string',
          format: 'date-time'
        }
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
  async createAuthor(@Body() dto: CreateAuthorDto) {
    return this.authorService.createAuthor(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Update an author',
    description: 'Updates an author in the system. ADMIN role required. Only provided fields will be updated.'
  })
  @ApiParam({
    name: 'id',
    description: 'Author UUID',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiBody({ type: UpdateAuthorDto })
  @ApiResponse({
    status: 200,
    description: 'Author successfully updated',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          example: '550e8400-e29b-41d4-a716-446655440000'
        },
        name: {
          type: 'string',
          example: 'J.K. Rowling'
        },
        bio: {
          type: 'string',
          nullable: true,
          example: 'British author, best known for the Harry Potter series'
        },
        createdAt: {
          type: 'string',
          format: 'date-time'
        }
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
    description: 'Author not found'
  })
  @ApiResponse({
    status: 409,
    description: 'Author with this name already exists'
  })
  async updateAuthor(@Param('id') id: string, @Body() dto: UpdateAuthorDto) {
    return this.authorService.updateAuthor(id, dto);
  }
}
