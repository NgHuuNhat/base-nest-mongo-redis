import { Global, Logger, Module, OnApplicationShutdown } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import Redis from 'ioredis';
import { REDIS_CLIENT } from 'src/shared/constants/redis.constant';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        const logger = new Logger('RedisInstance');
        const redisClient = new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT, 10) || 6379,
          password: process.env.REDIS_PASSWORD || undefined,
          db: parseInt(process.env.REDIS_DB, 10) || 0,
        });

        redisClient.on('connect', () => {
          logger.debug('🚀 [Redis] Connected successfully!');
        });

        redisClient.on('error', (err) => {
          logger.debug('❌ [Redis] Connection error:', err);
        });

        return redisClient;
      },
    },
    RedisService,
  ],
  exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(private readonly moduleRef: ModuleRef) {}

  async onApplicationShutdown() {
    const client = this.moduleRef.get<Redis>(REDIS_CLIENT);
    if (client) {
      await client.quit();
      console.log('🛑 [Redis] Connection closed.');
    }
  }
}
