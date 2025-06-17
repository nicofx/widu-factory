// crud-magic/src/services/pagination.service.ts

import { Injectable } from '@nestjs/common';
import { PaginationOptions } from '../interfaces/pagination.interface';

/**
 * PaginationService
 *
 * Lee `?page=` y `?limit=` del querystring.  
 * - Por defecto, page=1, limit=10.  
 * - Si se envía algo inválido, usamos los valores por defecto.
 *
 * Retorna un objeto con:
 *  { page, limit, skip, take }
 *
 * skip = (page - 1) * limit
 */
@Injectable()
export class PaginationService {
  parse(query: any): { page: number; limit: number; skip: number } {
    let page = 1;
    let limit = 10;

    if (query.page) {
      const p = Number(query.page);
      if (!isNaN(p) && p > 0) page = p;
    }
    if (query.limit) {
      const l = Number(query.limit);
      if (!isNaN(l) && l > 0) limit = l;
    }

    const skip = (page - 1) * limit;
    return { page, limit, skip };
  }
}
