import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { ClientSession, Connection, QueryFilter } from 'mongoose';
import { RedisService } from 'src/core/cache/redis/redis.service';
import { withTransaction } from 'src/core/database/transaction.helper';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from 'src/shared/constants/paginate.constant';
import { DEFAULT_TTL } from 'src/shared/constants/redis.constant';
import { DEFAULT_SALT } from 'src/shared/constants/security.constant';
import { parseSortQuery } from 'src/shared/helpers/sort.helper';
import { PaginatedResult } from 'src/shared/repositories/base-interface.repository';
import { BaseService } from '../../shared/services/base-abstract.service';
import { GetUsersQueryDto } from './dto/get-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserDocument } from './schema/user.schema';
import { UsersRepository } from './user.repository';

@Injectable()
export class UsersService extends BaseService<UserDocument> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly cacheService: RedisService,
    @InjectConnection() private readonly connection: Connection,
  ) {
    super(usersRepository);
  }

  async registerUser(body: RegisterUserDto): Promise<UserDocument> {
    return await withTransaction(this.connection, async (session: ClientSession) => {
      const hashedPassword = await bcrypt.hash(body.password, DEFAULT_SALT);
      const user = await this.create({ ...body, password: hashedPassword }, { session });
      return user;
    });
  }

  async findAllUsers(queryDto: GetUsersQueryDto): Promise<PaginatedResult<UserDocument>> {
    const { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, search, sort } = queryDto;

    const cachePrefix = 'users:list';
    const cacheKey = `${cachePrefix}:page=${page}:limit=${limit}:search=${search || ''}:sort=${sort || ''}`;
    const cachedData = await this.cacheService.getJson<PaginatedResult<UserDocument>>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const filter: QueryFilter<UserDocument> = { deletedAt: undefined };
    if (search) {
      filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    }
    const sortConfig = parseSortQuery(sort);

    const paginateResult = await this.findAllWithPaginate(filter, {
      page,
      limit,
      sort: sortConfig,
    });

    await this.cacheService.setJson(cacheKey, paginateResult, DEFAULT_TTL);

    return paginateResult;
  }
}
