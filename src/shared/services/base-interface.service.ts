import { QueryFilter, UpdateQuery, Document, PipelineStage } from 'mongoose';
import { RepositoryOptions, FindAllOptions, PaginatedResult } from '../repositories/base-interface.repository';

export interface IBaseService<T extends Document> {
  create(dto: Partial<T>, options?: RepositoryOptions): Promise<T>;
  findById(id: string, options?: RepositoryOptions): Promise<T | null>;
  findOne(filter: QueryFilter<T>, options?: RepositoryOptions): Promise<T | null>;
  findAllWithPaginate(filter?: QueryFilter<T>, options?: FindAllOptions): Promise<PaginatedResult<T>>;
  findAll(filter?: QueryFilter<T>, options?: FindAllOptions): Promise<T[]>;
  update(id: string, update: UpdateQuery<T>, options?: RepositoryOptions): Promise<T | null>;
  softDelete(id: string, options?: RepositoryOptions): Promise<boolean>;
  permanentlyDelete(id: string, options?: RepositoryOptions): Promise<boolean>;
  aggregate<R>(pipeline: PipelineStage[], options?: RepositoryOptions): Promise<R[]>;
}
