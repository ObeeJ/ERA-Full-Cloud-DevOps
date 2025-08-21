import { IServiceOptions } from './IServiceOptions';
import RedisService from './redisService';
import KafkaService from './kafkaService';

// Global service instances
let redisService: RedisService | null = null;
let kafkaService: KafkaService | null = null;

export const initializeServices = async (options: IServiceOptions): Promise<void> => {
  try {
    // Initialize Redis service
    if (!redisService) {
      redisService = new RedisService(options);
      console.log('Redis service initialized');
    }

    // Initialize Kafka service
    if (!kafkaService) {
      kafkaService = new KafkaService(options);
      await kafkaService.initialize();
      console.log('Kafka service initialized');
    }

    // Set up Kafka event consumers for audit logging
    await setupEventConsumers();

    console.log('All services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize services:', error);
    throw error;
  }
};

export const getRedisService = (): RedisService => {
  if (!redisService) {
    throw new Error('Redis service not initialized. Call initializeServices first.');
  }
  return redisService;
};

export const getKafkaService = (): KafkaService => {
  if (!kafkaService) {
    throw new Error('Kafka service not initialized. Call initializeServices first.');
  }
  return kafkaService;
};

export const shutdownServices = async (): Promise<void> => {
  try {
    if (kafkaService) {
      await kafkaService.disconnect();
      kafkaService = null;
    }

    if (redisService) {
      await redisService.disconnect();
      redisService = null;
    }

    console.log('All services shut down successfully');
  } catch (error) {
    console.error('Error shutting down services:', error);
  }
};

// Set up event consumers for cross-service communication
const setupEventConsumers = async (): Promise<void> => {
  if (!kafkaService) return;

  try {
    // Consumer for audit logging
    await kafkaService.subscribeToEvents(
      'audit-logger',
      ['created', 'updated', 'deleted', 'login', 'logout', 'action_performed'],
      async (event) => {
        console.log('Received event for audit logging:', {
          eventType: event.eventType,
          entityType: event.entityType,
          entityId: event.entityId,
          userId: event.userId,
          tenantId: event.tenantId,
          timestamp: event.timestamp,
        });

        // Here you could implement additional audit logging logic
        // For example, storing events in a dedicated audit table or external system
      }
    );

    // Consumer for cache invalidation
    await kafkaService.subscribeToEvents(
      'cache-invalidator',
      ['updated', 'deleted'],
      async (event) => {
        if (!redisService) return;

        const cachePattern = `cache:${event.entityType}:${event.entityId}*`;
        await redisService.flushPattern(cachePattern);
        
        console.log('Cache invalidated for:', cachePattern);
      }
    );

    // Consumer for notifications (could be extended)
    await kafkaService.subscribeToEvents(
      'notification-service',
      ['created', 'updated'],
      async (event) => {
        console.log('Notification event:', {
          eventType: event.eventType,
          entityType: event.entityType,
          entityId: event.entityId,
        });

        // Here you could implement notification logic
        // For example, sending emails, push notifications, etc.
      }
    );

    console.log('Event consumers set up successfully');
  } catch (error) {
    console.error('Failed to set up event consumers:', error);
  }
};

// Health check for all services
export const healthCheck = async (): Promise<{ redis: boolean; kafka: boolean }> => {
  const results = {
    redis: false,
    kafka: false,
  };

  try {
    if (redisService) {
      results.redis = await redisService.exists('health:check');
      // Set a health check value if it doesn't exist
      if (!results.redis) {
        results.redis = await redisService.set('health:check', 'ok', 60);
      }
    }

    if (kafkaService) {
      results.kafka = await kafkaService.healthCheck();
    }
  } catch (error) {
    console.error('Health check failed:', error);
  }

  return results;
};
