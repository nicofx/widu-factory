// crud-magic/src/services/bulk-ops.service.ts

import { Injectable } from '@nestjs/common';

/**
 * BulkOpsService
 *
 * - bulkCreate(): crea múltiples documentos en una sola operación
 * - bulkUpdate(): actualiza múltiples documentos en una sola operación
 *
 * Sprint 5: implementar usando Model.insertMany() y Model.bulkWrite()
 */
@Injectable()
export class BulkOpsService {
  async bulkCreate(
    tenantId: string,
    user: any,
    entityName: string,
    dtos: any[],
  ): Promise<any[]> {
    throw new Error('BulkOpsService.bulkCreate: not implemented');
  }

  async bulkUpdate(
    tenantId: string,
    user: any,
    entityName: string,
    items: { id: string; dto: any }[],
  ): Promise<any[]> {
    throw new Error('BulkOpsService.bulkUpdate: not implemented');
  }
}
