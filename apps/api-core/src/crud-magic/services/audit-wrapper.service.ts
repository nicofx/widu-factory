// src/crud-magic/services/audit-wrapper.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuditWrapperService {
  async log(tenantId: string, userId: string, action: string, resourceType: string, resourceId: string, metadata: any): Promise<void> {
    throw new Error('AuditWrapperService.log: not implemented');
  }
}
