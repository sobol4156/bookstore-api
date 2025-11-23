import { Controller, Get, Query, Param } from '@nestjs/common';
import { BooksService } from './books.service';
import { GetBooksQueryDto } from './dto/get-books-query.dto';

@Controller('books')
export class BooksController {

  constructor(private readonly booksService: BooksService) { }

  @Get()
  async getBooks(@Query() params: GetBooksQueryDto) {
    return this.booksService.getBooks(params);
  }

  @Get(':id')
  async getBookById(@Param('id') id: string) {
    return this.booksService.getBookById(id);
  }
}
