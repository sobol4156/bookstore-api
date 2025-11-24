import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';
import config from '../../config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor() {
    const redisConfig: RedisOptions = {
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    };

    if (config.REDIS_PASSWORD) {
      redisConfig.password = config.REDIS_PASSWORD;
    }

    this.client = new Redis(redisConfig);
  }

  async onModuleInit() {
    this.client.on('connect', () => {
      console.log('Redis connected');
    });

    this.client.on('error', (err) => {
      console.error('Redis error:', err);
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttl) {
      await this.client.setex(key, ttl, serialized);
    } else {
      await this.client.set(key, serialized);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async delPattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async addToBlacklist(token: string, ttl: number): Promise<void> {
    await this.set(`blacklist:${token}`, true, ttl);
  }

  async isBlacklisted(token: string): Promise<boolean> {
    return this.exists(`blacklist:${token}`);
  }

  getClient(): Redis {
    return this.client;
  }
}

