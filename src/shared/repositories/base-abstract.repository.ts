import { Document, Model, PipelineStage, QueryFilter, UpdateQuery } from 'mongoose';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from 'src/shared/constants/paginate.constant';
import { FindAllOptions, IBaseRepository, PaginatedResult, RepositoryOptions } from './base-interface.repository';

export abstract class BaseRepository<T extends Document> implements IBaseRepository<T> {
  protected constructor(protected readonly model: Model<T>) {}

  async create(dto: Partial<T>, options?: RepositoryOptions): Promise<T> {
    const createdEntity = new this.model(dto);
    const savedEntity = await createdEntity.save({ session: options?.session });
    return savedEntity as T;
  }

  async findById(id: string, options?: RepositoryOptions): Promise<T | null> {
    return this.model
      .findById(id, null, {
        session: options?.session,
        lean: options?.lean,
      })
      .exec();
  }

  async findOne(filter: QueryFilter<T>, options?: RepositoryOptions): Promise<T | null> {
    return this.model
      .findOne(filter, null, {
        session: options?.session,
        lean: options?.lean,
      })
      .exec();
  }

  async findAllWithPaginate(filter: QueryFilter<T> = {}, options?: FindAllOptions): Promise<PaginatedResult<T>> {
    // Đặt giá trị mặc định luôn ở đây để tránh lỗi logic tính toán
    const page = options?.page || DEFAULT_PAGE;
    const limit = options?.limit || DEFAULT_LIMIT;
    const { sort, populate, session, lean } = options || {};

    const query = this.model.find(filter, null, { session, lean });

    if (sort) query.sort(sort);
    if (populate) query.populate(populate);

    const skip = (page - 1) * limit;
    query.skip(skip).limit(limit);

    // Chạy song song Query và Count
    const [data, total] = await Promise.all([query.exec(), this.model.countDocuments(filter, { session }).exec()]);

    // Thêm logic tính toán Next/Prev
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data: data as T[],
      total,
      page,
      limit,
      totalPages,
      hasNext,
      hasPrev,
    };
  }

  async findAll(filter: QueryFilter<T> = {}, options?: FindAllOptions): Promise<T[]> {
    // Đặt giá trị mặc định luôn ở đây để tránh lỗi logic tính toán
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const { sort, populate, session, lean } = options || {};

    const query = this.model.find(filter, null, { session, lean });

    if (sort) query.sort(sort);
    if (populate) query.populate(populate);

    const skip = (page - 1) * limit;
    query.skip(skip).limit(limit);

    // Chạy song song Query và Count
    const [data, total] = await Promise.all([query.exec(), this.model.countDocuments(filter, { session }).exec()]);

    // Thêm logic tính toán Next/Prev

    return data;
  }

  async update(id: string, update: UpdateQuery<T>, options?: RepositoryOptions): Promise<T | null> {
    return this.model
      .findByIdAndUpdate(id, update, {
        new: true,
        session: options?.session,
      })
      .exec();
  }

  async softDelete(id: string, options?: RepositoryOptions): Promise<boolean> {
    const result = await this.model
      .findByIdAndUpdate(id, { $set: { deletedAt: new Date() } } as UpdateQuery<T>, { session: options?.session })
      .exec();
    return result !== null;
  }

  async permanentlyDelete(id: string, options?: RepositoryOptions): Promise<boolean> {
    const result = await this.model
      .findByIdAndDelete(id, {
        session: options?.session,
      })
      .exec();
    return result !== null;
  }

  async aggregate<R>(pipeline: PipelineStage[], options?: RepositoryOptions): Promise<R[]> {
    return this.model
      .aggregate(pipeline)
      .session(options?.session || null) // Nếu có session thì gắn vào
      .exec() as Promise<R[]>;
  }
}
