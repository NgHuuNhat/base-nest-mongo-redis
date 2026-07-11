// src/services/base.abstract.service.ts
import { Document, PipelineStage, QueryFilter, UpdateQuery } from 'mongoose';
import {
  IBaseRepository,
  RepositoryOptions,
  FindAllOptions,
  PaginatedResult,
} from '../repositories/base-interface.repository';
import { IBaseService } from './base-interface.service';

export abstract class BaseService<T extends Document> implements IBaseService<T> {
  protected constructor(protected readonly repository: IBaseRepository<T>) {}

  async create(dto: Partial<T>, options?: RepositoryOptions): Promise<T> {
    return this.repository.create(dto, options);
  }

  async findById(id: string, options?: RepositoryOptions): Promise<T | null> {
    return this.repository.findById(id, options);
  }

  async findOne(filter: QueryFilter<T>, options?: RepositoryOptions): Promise<T | null> {
    return this.repository.findOne(filter, options);
  }

  async findAllWithPaginate(filter: QueryFilter<T> = {}, options?: FindAllOptions): Promise<PaginatedResult<T>> {
    return this.repository.findAllWithPaginate(filter, options);
  }

  async findAll(filter: QueryFilter<T> = {}, options?: FindAllOptions): Promise<T[]> {
    return this.repository.findAll(filter, options);
  }

  async update(id: string, update: UpdateQuery<T>, options?: RepositoryOptions): Promise<T | null> {
    return this.repository.update(id, update, options);
  }

  async softDelete(id: string, options?: RepositoryOptions): Promise<boolean> {
    return this.repository.softDelete(id, options);
  }

  async permanentlyDelete(id: string, options?: RepositoryOptions): Promise<boolean> {
    return this.repository.permanentlyDelete(id, options);
  }

  async aggregate<R>(pipeline: PipelineStage[], options?: RepositoryOptions): Promise<R[]> {
    return this.repository.aggregate(pipeline, options);
  }
}
