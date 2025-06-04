// crud-magic/src/services/soft-delete.service.ts

import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';

/**
 * SoftDeleteService
 *
 * Ofrece métodos para:
 *  - applySoftDeleteFlag(): en vez de eliminar físicamente, marca “deleted: true” y “deletedAt: Date.now()”
 *  - filterDeleted(): agrega “deleted: false” a los filtros de búsqueda
 *
 * Sprint 3: implementar estos dos métodos de forma genérica para cualquier entidad.
 */
@Injectable()
export class SoftDeleteService {
  async applySoftDeleteFlag(
    tenantId: string,
    entityName: string,
    id: string,
  ): Promise<void> {
    throw new Error('SoftDeleteService.applySoftDeleteFlag: not implemented');
  }

  filterDeleted(
    tenantId: string,
    entityName: string,
    baseFilter: any,
  ): any {
    throw new Error('SoftDeleteService.filterDeleted: not implemented');
  }
}
