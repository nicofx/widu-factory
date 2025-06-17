// crud-magic/src/services/filtering.service.ts

import { Injectable } from '@nestjs/common';

@Injectable()
export class FilteringService {
  /**
   * buildFilter:
   *   - query: objeto con todos los parámetros de URL (por ejemplo, { name: 'foo', status: 'activo', budgetMin: '1000', budgetMax: '5000' }).
   *   - filtrosDef: definición de tipo EntityFeature.filtros (buscarTexto, camposExactos, camposRango).
   *
   * Retorna un objeto que puede pasarse directamente a Mongoose.
   */
  buildFilter(
    query: Record<string, any>,
    filtrosDef?: {
      buscarTexto?: string[];
      camposExactos?: string[];
      camposRango?: string[];
    },
  ): Record<string, any> {
    const filter: Record<string, any> = {};

    if (!filtrosDef) {
      return filter;
    }

    // 1) Campos de “texto libre” (texto i-case-insensitive)
    if (Array.isArray(filtrosDef.buscarTexto)) {
      for (const campo of filtrosDef.buscarTexto) {
        const valor = query[campo];
        if (typeof valor === 'string' && valor.trim() !== '') {
          filter[campo] = { $regex: valor.trim(), $options: 'i' };
        }
      }
    }

    // 2) Campos de “coincidencia exacta”
    if (Array.isArray(filtrosDef.camposExactos)) {
      for (const campo of filtrosDef.camposExactos) {
        const valor = query[campo];
        if (valor !== undefined && valor !== null && valor !== '') {
          filter[campo] = valor;
        }
      }
    }

    // 3) Campos de “rango” (numérico o fecha)
    if (Array.isArray(filtrosDef.camposRango)) {
      for (const campo of filtrosDef.camposRango) {
        const minKey = `${campo}Min`;
        const maxKey = `${campo}Max`;
        const valorMin = query[minKey];
        const valorMax = query[maxKey];
        if (valorMin !== undefined || valorMax !== undefined) {
          filter[campo] = {};
          if (valorMin !== undefined && valorMin !== '') {
            const numMin = this._parseValue(valorMin);
            filter[campo].$gte = numMin;
          }
          if (valorMax !== undefined && valorMax !== '') {
            const numMax = this._parseValue(valorMax);
            filter[campo].$lte = numMax;
          }
          // Si quedó vacío, lo borramos
          if (Object.keys(filter[campo]).length === 0) {
            delete filter[campo];
          }
        }
      }
    }

    return filter;
  }

  /**
   * Convierte cadenas numéricas o booleanas en número/boolean.
   */
  private _parseValue(val: any): any {
    // Si es número válido, lo convertimos a Number
    const num = Number(val);
    if (!isNaN(num) && typeof val === 'string') {
      return num;
    }
    // Si es “true” / “false”
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val;
  }
}
