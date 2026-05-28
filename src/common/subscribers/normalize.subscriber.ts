import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { normalizeString } from '../utils/normalize.util';

const SKIP_PROPERTIES = new Set([
  'passHash',
  'hashSha256',
  'uuid',
  'urlMapa',
  'rutaRelativa',
  'mimeType',
  'numeroSerie',
  'crrIdPjud',
  'folioInterno',
  'latitud',
  'longitud',
  'requestBody',
  'responseBody',
  'errorDesc',
  'mensajeRespuesta',
  'detalles',
  'setupSecret',
]);

@EventSubscriber()
export class NormalizeSubscriber implements EntitySubscriberInterface {
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
      if (SKIP_PROPERTIES.has(key)) continue;

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
