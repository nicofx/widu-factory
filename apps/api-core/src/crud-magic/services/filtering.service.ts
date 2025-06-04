// crud-magic/src/services/filtering.service.ts

import { Injectable } from '@nestjs/common';

/**
 * FilteringService
 *
 * Convierte los query-params `?filter[name]=foo&filter[age][gt]=30` en un objeto
 * { name: 'foo', age: { $gt: 30 } }
 *
 * Este ejemplo es muy simple: asume que el cliente envía algo así como:
 *  ?filter[field]=value            → { field: 'value' }
 *  ?filter[field][gt]=100          → { field: { $gt: 100 } }
 *  ?filter[field][lt]=200          → { field: { $lt: 200 } }
 *  ?filter[field][in]=val1,val2    → { field: { $in: ['val1','val2'] } }
 *
 * Si no hay `filter` en req.query, retorna {}.
 */
@Injectable()
export class FilteringService {
  buildFilter(query: any): Record<string, any> {
    const out: Record<string, any> = {};
    const rawFilter = query.filter;
    if (!rawFilter || typeof rawFilter !== 'object') {
      return out;
    }

    for (const [field, cond] of Object.entries(rawFilter as Record<string, any>)) {
      if (typeof cond === 'string' || typeof cond === 'number' || Array.isArray(cond)) {
        // ?filter[field]=value
        out[field] = cond;
      } else if (typeof cond === 'object') {
        // ?filter[field][gt]=value, ?filter[field][in]=val1,val2
        const operatorObj: Record<string, any> = {};
        for (const [opKey, opVal] of Object.entries(cond)) {
          switch (opKey) {
            case 'gt':
              operatorObj['$gt'] = this._parseValue(opVal);
              break;
            case 'lt':
              operatorObj['$lt'] = this._parseValue(opVal);
              break;
            case 'gte':
              operatorObj['$gte'] = this._parseValue(opVal);
              break;
            case 'lte':
              operatorObj['$lte'] = this._parseValue(opVal);
              break;
            case 'in':
              operatorObj['$in'] = ('' + opVal).split(',').map((v) => this._parseValue(v));
              break;
            case 'neq':
              operatorObj['$ne'] = this._parseValue(opVal);
              break;
            // agregar más operadores según necesidad…
            default:
              break;
          }
        }
        out[field] = operatorObj;
      }
    }
    return out;
  }

  private _parseValue(val: any): any {
    // Si es número, convertir a Number
    const num = Number(val);
    if (!isNaN(num) && typeof val === 'string') {
      return num;
    }
    // si viene “true” / “false”
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val;
  }
}
