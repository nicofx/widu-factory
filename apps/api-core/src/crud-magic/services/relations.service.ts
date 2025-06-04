// crud-magic/src/services/relations.service.ts

import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';

/**
 * RelationsService
 *
 * Métodos:
 *  - validateRelations(): para cada campo relacional en el DTO, verifica que exista
 *      el documento en la colección asociada y que el usuario tenga permiso de leerlo.
 *  - applyPopulate(): construye la llamada .populate(...) en el query de Mongoose.
 *
 * Sprint 4: implementar validateRelations() y applyPopulate() usando Mongoose.
 */
@Injectable()
export class RelationsService {
  async validateRelations(
    tenantId: string,
    user: any,
    entityName: string,
    relationsInBody: Record<string, any>,
  ): Promise<void> {
    throw new Error('RelationsService.validateRelations: not implemented');
  }

  applyPopulate(
    tenantId: string,
    entityName: string,
    query: any,
    populateFields?: string[],
  ): any {
    throw new Error('RelationsService.applyPopulate: not implemented');
  }
}
