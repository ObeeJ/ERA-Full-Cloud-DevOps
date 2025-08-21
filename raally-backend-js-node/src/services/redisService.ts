import Redis from 'ioredis';
import { IServiceOptions } from './IServiceOptions';

export default class RedisService {
  private client: Redis;
  private static instance: RedisService;

  constructor(options: IServiceOptions) {
    if (RedisService.instance) {
      return RedisService.instance;
    }

    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    const redisPassword = process.env.REDIS_PASSWORD;

    this.client = new Redis(redisUrl, {
      password: redisPassword,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      keyPrefix: 'raally:',
    });

    this.client.on('error', (err) => {
      console.error('Redis connection error:', err);
    });

    this.client.on('connect', () => {
      console.log('Redis connected successfully');
    });

    RedisService.instance = this;
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  async set(key: string, value: string, expirationInSeconds?: number): Promise<boolean> {
    try {
      if (expirationInSeconds) {
        await this.client.setex(key, expirationInSeconds, value);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  }

  async increment(key: string, value: number = 1): Promise<number | null> {
    try {
      return await this.client.incrby(key, value);
    } catch (error) {
      console.error('Redis INCRBY error:', error);
      return null;
    }
  }

  async setHash(key: string, field: string, value: string): Promise<boolean> {
    try {
      await this.client.hset(key, field, value);
      return true;
    } catch (error) {
      console.error('Redis HSET error:', error);
      return false;
    }
  }

  async getHash(key: string, field: string): Promise<string | null> {
    try {
      return await this.client.hget(key, field);
    } catch (error) {
      console.error('Redis HGET error:', error);
      return null;
    }
  }

  async getAllHash(key: string): Promise<Record<string, string>> {
    try {
      return await this.client.hgetall(key);
    } catch (error) {
      console.error('Redis HGETALL error:', error);
      return {};
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, seconds);
      return result === 1;
    } catch (error) {
      console.error('Redis EXPIRE error:', error);
      return false;
    }
  }

  async flushPattern(pattern: string): Promise<boolean> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
      return true;
    } catch (error) {
      console.error('Redis FLUSH PATTERN error:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
    } catch (error) {
      console.error('Redis disconnect error:', error);
    }
  }

  getClient(): Redis {
    return this.client;
  }

  // Cache wrapper for common operations
  async cache<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    expirationInSeconds: number = 3600
  ): Promise<T> {
    try {
      const cached = await this.get(key);
      if (cached) {
        return JSON.parse(cached);
      }

      const result = await fetchFunction();
      await this.set(key, JSON.stringify(result), expirationInSeconds);
      return result;
    } catch (error) {
      console.error('Redis cache error:', error);
      // Fallback to direct function call if Redis fails
      return await fetchFunction();
    }
  }

  // Rate limiting helper
  async isRateLimited(identifier: string, maxRequests: number, windowInSeconds: number): Promise<boolean> {
    try {
      const key = `rate_limit:${identifier}`;
      const current = await this.increment(key);
      
      if (current === 1) {
        await this.expire(key, windowInSeconds);
      }

      return current !== null && current > maxRequests;
    } catch (error) {
      console.error('Redis rate limit error:', error);
      return false; // Allow request if Redis fails
    }
  }

  // Session storage helpers
  async setSession(sessionId: string, data: any, expirationInSeconds: number = 86400): Promise<boolean> {
    return await this.set(`session:${sessionId}`, JSON.stringify(data), expirationInSeconds);
  }

  async getSession(sessionId: string): Promise<any | null> {
    try {
      const data = await this.get(`session:${sessionId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis get session error:', error);
      return null;
    }
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    return await this.del(`session:${sessionId}`);
  }
}
