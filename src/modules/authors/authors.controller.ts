import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthorService } from './authors.service';
import { GetAuthorsQueryDto } from './dto/get-authors-query.dto';

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
    summary: 'Get an author by ID',
    description: 'Returns a single author by their unique identifier.'
  })
  @ApiResponse({
    status: 200,
    description: 'Author successfully retrieved',
  })
  async getAuthorById(@Param('id') id: string) {
    return this.authorService.getAuthorById(id);
  }
}
