// Prisma query types
import { Prisma } from '@prisma/client';

// Sample query types
export type SampleWhereInput = Prisma.SampleWhereInput;
export type SampleOrderByWithRelationInput = Prisma.SampleOrderByWithRelationInput;
export type SampleInclude = Prisma.SampleInclude;

// Library query types
export type LibraryWhereInput = Prisma.LibraryWhereInput;
export type LibraryOrderByWithRelationInput = Prisma.LibraryOrderByWithRelationInput;
export type LibraryInclude = Prisma.LibraryInclude;

// Category query types
export type CategoryWhereInput = Prisma.CategoryWhereInput;
export type CategoryOrderByWithRelationInput = Prisma.CategoryOrderByWithRelationInput;
export type CategoryInclude = Prisma.CategoryInclude;

// User query types
export type UserWhereInput = Prisma.UserWhereInput;
export type UserOrderByWithRelationInput = Prisma.UserOrderByWithRelationInput;
export type UserInclude = Prisma.UserInclude;

// Generic query builder types
export interface QueryBuilder<T> {
  where?: T;
  orderBy?: Record<string, 'asc' | 'desc'>;
  include?: Record<string, boolean | object>;
  skip?: number;
  take?: number;
}

// Search query types
export interface SearchableFields {
  name?: { contains: string; mode: Prisma.QueryMode };
  description?: { contains: string; mode: Prisma.QueryMode };
}

// Generic database operation result
export interface DatabaseResult<T> {
  data: T | T[];
  count?: number;
  error?: Error;
}