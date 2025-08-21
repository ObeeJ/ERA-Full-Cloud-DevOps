import { Kafka, Producer, Consumer, EachMessagePayload } from 'kafkajs';
import { IServiceOptions } from './IServiceOptions';

export interface KafkaMessage {
  topic: string;
  key?: string;
  value: any;
  headers?: Record<string, string>;
  timestamp?: string;
}

export interface EventData {
  eventType: string;
  entityType: string;
  entityId: string;
  userId?: string;
  tenantId?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export default class KafkaService {
  private kafka: Kafka;
  private producer: Producer;
  private consumers: Map<string, Consumer> = new Map();
  private static instance: KafkaService;

  constructor(options: IServiceOptions) {
    if (KafkaService.instance) {
      return KafkaService.instance;
    }

    const brokers = process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'];
    const clientId = process.env.KAFKA_CLIENT_ID || 'raally-app';

    this.kafka = new Kafka({
      clientId,
      brokers,
      retry: {
        retries: 5,
        initialRetryTime: 100,
        maxRetryTime: 30000,
      },
    });

    this.producer = this.kafka.producer({
      allowAutoTopicCreation: true,
      transactionTimeout: 30000,
    });

    KafkaService.instance = this;
  }

  async initialize(): Promise<void> {
    try {
      await this.producer.connect();
      console.log('Kafka producer connected successfully');
    } catch (error) {
      console.error('Failed to connect Kafka producer:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.producer.disconnect();
      
      // Disconnect all consumers
      for (const [groupId, consumer] of this.consumers) {
        await consumer.disconnect();
      }
      this.consumers.clear();
      
      console.log('Kafka disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting Kafka:', error);
    }
  }

  async publishEvent(event: EventData): Promise<boolean> {
    try {
      const message: KafkaMessage = {
        topic: this.getTopicName(event.eventType, event.entityType),
        key: event.entityId,
        value: event,
        headers: {
          eventType: event.eventType,
          entityType: event.entityType,
          tenantId: event.tenantId || 'default',
        },
        timestamp: event.timestamp,
      };

      await this.sendMessage(message);
      return true;
    } catch (error) {
      console.error('Failed to publish event:', error);
      return false;
    }
  }

  async sendMessage(message: KafkaMessage): Promise<void> {
    try {
      await this.producer.send({
        topic: message.topic,
        messages: [{
          key: message.key,
          value: JSON.stringify(message.value),
          headers: message.headers,
          timestamp: message.timestamp,
        }],
      });
    } catch (error) {
      console.error('Failed to send Kafka message:', error);
      throw error;
    }
  }

  async createConsumer(groupId: string): Promise<Consumer> {
    if (this.consumers.has(groupId)) {
      return this.consumers.get(groupId)!;
    }

    const consumer = this.kafka.consumer({ 
      groupId,
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
    });

    await consumer.connect();
    this.consumers.set(groupId, consumer);
    
    console.log(`Kafka consumer created for group: ${groupId}`);
    return consumer;
  }

  async subscribeToEvents(
    groupId: string,
    eventTypes: string[],
    handler: (event: EventData) => Promise<void>
  ): Promise<void> {
    try {
      const consumer = await this.createConsumer(groupId);
      
      // Subscribe to all relevant topics
      const topics = this.getTopicsForEventTypes(eventTypes);
      for (const topic of topics) {
        await consumer.subscribe({ topic });
      }

      await consumer.run({
        eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
          try {
            if (message.value) {
              const eventData: EventData = JSON.parse(message.value.toString());
              await handler(eventData);
            }
          } catch (error) {
            console.error('Error processing Kafka message:', error);
          }
        },
      });

      console.log(`Subscribed to events: ${eventTypes.join(', ')}`);
    } catch (error) {
      console.error('Failed to subscribe to events:', error);
      throw error;
    }
  }

  private getTopicName(eventType: string, entityType: string): string {
    return `raally.${entityType}.${eventType}`;
  }

  private getTopicsForEventTypes(eventTypes: string[]): string[] {
    // Generate topic patterns for all entity types
    const entityTypes = ['user', 'tenant', 'project', 'assignment', 'audit'];
    const topics: string[] = [];

    for (const eventType of eventTypes) {
      for (const entityType of entityTypes) {
        topics.push(this.getTopicName(eventType, entityType));
      }
    }

    return topics;
  }

  // Specific event publishers for common use cases
  async publishUserEvent(eventType: 'created' | 'updated' | 'deleted' | 'login' | 'logout', userId: string, tenantId?: string, metadata?: Record<string, any>): Promise<boolean> {
    const event: EventData = {
      eventType,
      entityType: 'user',
      entityId: userId,
      userId,
      tenantId,
      metadata,
      timestamp: new Date().toISOString(),
    };

    return await this.publishEvent(event);
  }

  async publishTenantEvent(eventType: 'created' | 'updated' | 'deleted', tenantId: string, userId?: string, metadata?: Record<string, any>): Promise<boolean> {
    const event: EventData = {
      eventType,
      entityType: 'tenant',
      entityId: tenantId,
      userId,
      tenantId,
      metadata,
      timestamp: new Date().toISOString(),
    };

    return await this.publishEvent(event);
  }

  async publishProjectEvent(eventType: 'created' | 'updated' | 'deleted', projectId: string, tenantId: string, userId?: string, metadata?: Record<string, any>): Promise<boolean> {
    const event: EventData = {
      eventType,
      entityType: 'project',
      entityId: projectId,
      userId,
      tenantId,
      metadata,
      timestamp: new Date().toISOString(),
    };

    return await this.publishEvent(event);
  }

  async publishAssignmentEvent(eventType: 'created' | 'updated' | 'deleted', assignmentId: string, tenantId: string, userId?: string, metadata?: Record<string, any>): Promise<boolean> {
    const event: EventData = {
      eventType,
      entityType: 'assignment',
      entityId: assignmentId,
      userId,
      tenantId,
      metadata,
      timestamp: new Date().toISOString(),
    };

    return await this.publishEvent(event);
  }

  async publishAuditEvent(eventType: 'action_performed', auditId: string, tenantId: string, userId: string, metadata?: Record<string, any>): Promise<boolean> {
    const event: EventData = {
      eventType,
      entityType: 'audit',
      entityId: auditId,
      userId,
      tenantId,
      metadata,
      timestamp: new Date().toISOString(),
    };

    return await this.publishEvent(event);
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      // Try to send a simple health check message
      const testTopic = 'raally.health.check';
      await this.producer.send({
        topic: testTopic,
        messages: [{
          key: 'health',
          value: JSON.stringify({ timestamp: new Date().toISOString() }),
        }],
      });
      return true;
    } catch (error) {
      console.error('Kafka health check failed:', error);
      return false;
    }
  }
}
