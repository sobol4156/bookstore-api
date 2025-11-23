import { Controller, Get, Query, Param, Body, Post, UseGuards } from '@nestjs/common';
import { BooksService } from './books.service';
import { GetBooksQueryDto } from './dto/get-books-query.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from '../auth/roles/roles.guard';

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

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createBook(@Body() dto: CreateBookDto) {
    return this.booksService.createBook(dto);
  }
}
