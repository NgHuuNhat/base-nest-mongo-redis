import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from 'src/shared/constants/redis.constant';

@Injectable()
export class RedisService {
  private logger = new Logger('RedisService');
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  // 1. Hàm SET thuần túy cho String
  async set(key: string, value: string, ttlInSeconds?: number): Promise<void> {
    if (ttlInSeconds) {
      await this.redis.set(key, value, 'EX', ttlInSeconds);
    } else {
      await this.redis.set(key, value);
    }
    this.logger.debug(`set key [${key}]`);
  }

  // 2. Hàm GET thuần túy cho String
  async get(key: string): Promise<string | null> {
    this.logger.debug(`cache key [${key}]`);
    return this.redis.get(key);
  }

  // 3. Hàm SETJSON chuyên dụng để lưu Object/Array
  async setJson(key: string, value: Record<string, any> | any[], ttlInSeconds?: number): Promise<void> {
    const stringifyValue = JSON.stringify(value);
    if (ttlInSeconds) {
      await this.redis.set(key, stringifyValue, 'EX', ttlInSeconds);
    } else {
      await this.redis.set(key, stringifyValue);
    }
    this.logger.debug(`set json key [${key}]`);
  }

  // 4. Hàm GETJSON chuyên dụng tự động parse kèm Generic <T> để ép kiểu dữ liệu
  async getJson<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    if (!data) return null;
    this.logger.debug(`cache json key [${key}]`);
    try {
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`❌ [Redis] Failed to parse JSON for key "${key}":`, error);
      return null; // Trả về null nếu data trong Redis không phải format JSON hợp lệ
    }
  }

  // Xóa cache theo key
  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  // Xóa cache hàng loạt theo pattern (Ví dụ: "users:*")
  async delByPattern(pattern: string): Promise<void> {
    const stream = this.redis.scanStream({ match: pattern });
    stream.on('data', async (keys: string[]) => {
      if (keys.length > 0) {
        const pipeline = this.redis.pipeline();
        keys.forEach((key) => pipeline.del(key));
        await pipeline.exec();
      }
    });
  }

  private getKey(userId: string): string {
    return `user:connection:${userId}`;
  }

  // 1. Thêm một socketId vào userId (Dùng Set để tránh trùng lặp)
  async addConnection(userId: string, socketId: string): Promise<void> {
    const key = this.getKey(userId);
    await this.redis.sadd(key, socketId);
    // Best practice: Đặt TTL (Time-to-live) đề phòng trường hợp server sập đột ngột không kịp dọn rác
    await this.redis.expire(key, 86400); // 24 giờ hoạt động liên tục
  }

  // 2. Xóa một socketId khi user disconnect
  async removeConnection(userId: string, socketId: string): Promise<void> {
    const key = this.getKey(userId);
    await this.redis.srem(key, socketId);
  }

  // 3. Lấy tất cả socketId của một user để gửi thông báo
  async getConnections(userId: string): Promise<string[]> {
    const key = this.getKey(userId);
    return await this.redis.smembers(key);
  }
}
