import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { DbModule } from '../db/db.module';

@Module({
  controllers: [CategoriesController],
  imports: [DbModule],
  providers: [CategoriesService],
})
export class CategoriesModule { }

