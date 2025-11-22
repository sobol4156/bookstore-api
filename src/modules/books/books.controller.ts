import { Controller, Get, Query } from '@nestjs/common';
import { BooksService } from './books.service';
import type { GetBooksQueryDto, GetBooksQueryDtoDefault } from './dto/get-books-query.dto';

@Controller('books')
export class BooksController {

  constructor(private readonly booksService: BooksService) { }

  @Get()
  async getBooks(@Query() params?: GetBooksQueryDto) {
    const defaultParams: GetBooksQueryDtoDefault = {
      page: params?.page ? Number(params.page) : 1,
      limit: params?.limit ? Number(params.limit) : 10,
      authorId: params?.authorId,
      categoryId: params?.categoryId,
      year: params?.year ? Number(params.year) : undefined,
      status: params?.status,
      search: params?.search,
    };
    return this.booksService.getBooks(defaultParams);
  }
}
