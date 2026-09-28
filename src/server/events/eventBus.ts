// Microservices Event Bus / Message Broker
// Implements asynchronous pub/sub messaging across services (e.g. RabbitMQ / Redis PubSub / Kafka pattern)

export type MicroserviceEventType =
  | 'AUTH_USER_REGISTERED'
  | 'EXAM_ATTEMPT_STARTED'
  | 'EXAM_ATTEMPT_SUBMITTED'
  | 'BOOKMARK_CREATED'
  | 'BOOKMARK_DELETED'
  | 'OFFLINE_ATTEMPTS_SYNCED';

export interface MicroserviceEvent<T = any> {
  id: string;
  type: MicroserviceEventType;
  sourceService: string;
  timestamp: string;
  payload: T;
}

type EventHandler<T = any> = (event: MicroserviceEvent<T>) => void | Promise<void>;

class EventBus {
  private handlers = new Map<MicroserviceEventType, Set<EventHandler>>();
  private recentEvents: MicroserviceEvent[] = [];
  private maxHistory = 50;

  constructor() {
    this.publish({
      id: `evt_init_${Date.now()}`,
      type: 'AUTH_USER_REGISTERED',
      sourceService: 'auth-service',
      timestamp: new Date().toISOString(),
      payload: { userId: 'usr_rakib_01', email: 'rakib.edu.bd@gmail.com' },
    });
  }

  subscribe<T = any>(eventType: MicroserviceEventType, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    const handlersSet = this.handlers.get(eventType)!;
    handlersSet.add(handler as EventHandler);

    return () => {
      handlersSet.delete(handler as EventHandler);
    };
  }

  publish<T = any>(event: MicroserviceEvent<T>): void {
    // Record in event store
    this.recentEvents.unshift(event);
    if (this.recentEvents.length > this.maxHistory) {
      this.recentEvents.pop();
    }

    const handlersSet = this.handlers.get(event.type);
    if (handlersSet) {
      handlersSet.forEach(async (handler) => {
        try {
          await handler(event);
        } catch (err) {
          console.error(`[EventBus] Error in event handler for ${event.type}:`, err);
        }
      });
    }
  }

  getRecentEvents(): MicroserviceEvent[] {
    return [...this.recentEvents];
  }
}

export const eventBus = new EventBus();
