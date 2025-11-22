import { BookStatus } from "@prisma/client";

export type GetBooksQueryDtoDefault = 
  Required<Pick<GetBooksQueryDto, 'page' | 'limit'>> & Partial<Omit<GetBooksQueryDto, 'page' | 'limit'>>;

export interface GetBooksQueryDto {
  page?: number;
  limit?: number;
  authorId?: string;
  categoryId?: string;
  year?: number;
  status?: BookStatus;
  search?: string;
}