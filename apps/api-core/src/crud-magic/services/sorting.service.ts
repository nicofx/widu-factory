// crud-magic/src/services/sorting.service.ts

import { Injectable } from '@nestjs/common';

/**
 * SortingService
 *
 * Convierte `?sort=+name,-createdAt` en un objeto Mongoose: { name: 1, createdAt: -1 }
 * - Si el parámetro `sort` es omitido → retorna {}.
 * - Si se envía como `?sort=name` se considera ascendente.
 * - “+campo” ascendente, “-campo” descendente.
 */
@Injectable()
export class SortingService {
  buildSort(query: any): Record<string, 1 | -1> {
    const raw = query.sort;
    const out: Record<string, 1 | -1> = {};
    if (!raw) return out;

    // Puede venir como array o como string: 
    //   ?sort=+name,-createdAt
    const fields = Array.isArray(raw) ? raw : ('' + raw).split(',');

    for (const token of fields) {
      if (!token) continue;
      const trimmed = token.trim();
      if (trimmed.startsWith('-')) {
        const field = trimmed.slice(1);
        out[field] = -1;
      } else if (trimmed.startsWith('+')) {
        const field = trimmed.slice(1);
        out[field] = 1;
      } else {
        out[trimmed] = 1;
      }
    }
    return out;
  }
}
