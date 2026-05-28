import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { normalizeString } from '../utils/normalize.util';
import { Logger } from '@nestjs/common';

@EventSubscriber()
export class NormalizeSubscriber implements EntitySubscriberInterface {
  private readonly logger = new Logger(NormalizeSubscriber.name);

  beforeInsert(event: InsertEvent<any>): void {
    this.normalizeEntity(event.entity);
  }

  beforeUpdate(event: UpdateEvent<any>): void {
    if (event.entity) {
      this.normalizeEntity(event.entity);
    }
  }

  private normalizeEntity(entity: any): void {
    if (!entity || typeof entity !== 'object') return;

    for (const key of Object.keys(entity)) {
      const value = entity[key];
      if (typeof value === 'string') {
        const normalized = normalizeString(value);
        if (normalized !== value) {
          entity[key] = normalized;
        }
      }
    }
  }
}
