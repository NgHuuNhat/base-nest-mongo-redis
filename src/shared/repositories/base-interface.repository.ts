import { ClientSession, Document, PipelineStage, PopulateOptions, QueryFilter, SortOrder, UpdateQuery } from 'mongoose';

export interface RepositoryOptions {
  session?: ClientSession;
  lean?: boolean;
  traceId?: string;
  userId?: string;
}

export interface FindAllOptions extends RepositoryOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, SortOrder>;
  populate?: PopulateOptions;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface IBaseRepository<T extends Document> {
  create(dto: Partial<T>, options?: RepositoryOptions): Promise<T>;
  findById(id: string, options?: RepositoryOptions): Promise<T | null>;
  findOne(filter: QueryFilter<T>, options?: RepositoryOptions): Promise<T | null>;
  findAll(filter?: QueryFilter<T>, options?: FindAllOptions): Promise<T[]>;
  findAllWithPaginate(filter?: QueryFilter<T>, options?: FindAllOptions): Promise<PaginatedResult<T>>;
  update(id: string, update: UpdateQuery<T>, options?: RepositoryOptions): Promise<T | null>;
  softDelete(id: string, options?: RepositoryOptions): Promise<boolean>;
  permanentlyDelete(id: string, options?: RepositoryOptions): Promise<boolean>;
  aggregate<R>(pipeline: PipelineStage[], options?: RepositoryOptions): Promise<R[]>;
}
