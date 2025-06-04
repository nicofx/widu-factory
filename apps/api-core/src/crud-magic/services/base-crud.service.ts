// crud-magic/src/services/base-crud.service.ts

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { EntityFeature } from '../interfaces/entity-feature.interface';
import { FilteringService } from './filtering.service';
import { SoftDeleteService } from './soft-delete.service';
import { RelationsService } from './relations.service';
import { ImportExportService } from './import-export.service';

import { HooksService } from './hooks.service';
import { BulkOpsService } from './bulk-ops.service';
import { I18nService } from './i18n.service';
import { MetricsService } from './metrics.service';
import { HaclService } from './hacl.service';

/**
* BaseCrudService
*
* Servicio genérico que implementa:
*  - create
*  - findAll
*  - findOne
*  - update
*  - delete
*  - bulkCreate, bulkUpdate
*  - exportCsv, importCsv
*
* Por ahora cada método lanza 'Not implemented'. En futuros sprints completaremos la lógica
* usando los demás servicios (filtering, hacl, softDelete, relations, importExport, bulkOps, i18n, metrics, hooks, cache).
*/
@Injectable()
export class BaseCrudService {
  private model: any = null;  // o un valor por defecto
  
  constructor(
    private readonly entityName: string,
    private readonly feature: EntityFeature,
    private readonly filteringService: FilteringService,
    private readonly haclService: HaclService,
    private readonly softDeleteService: SoftDeleteService,
    private readonly relationsService: RelationsService,
    private readonly importExportService: ImportExportService,
    private readonly bulkOpsService: BulkOpsService,
    private readonly i18nService: I18nService,
    private readonly metricsService: MetricsService,
    private readonly hooksService: HooksService,
  ) {
    // En el forFeature inyectamos Model a través de MongooseModule.forFeature
    // Aquí asumimos que el provider “CRUD_SERVICE_<NAME>” recibió el Model ya configurado,
    // pero para simplificar este constructor, omitimos la inyección directa del model.
    
  }
  
  
  async findAll(
    tenantId: string,
    user: any,
    filter: Record<string, any>,
    sort: Record<string, 1 | -1>,
    skip: number,
    limit: number,
  ): Promise<[any[], number]> {
    // Suponiendo que cada doc almacena tenantId en el campo `tenantId`
    /**
    * Flujo:
    * 1) HACL: checkPermission(tenantId, user, feature.permisos.read)
    * 2) Construir filter: filteringService.buildFilter(queryOpts)
    * 3) Soft‐delete: filter = softDeleteService.filterDeleted(...)
    * 4) Relaciones: aplicar populate en query
    * 5) Cache: intentar leer de cachePluginService.get( key )
    *     si existe, devolver respuesta cacheada
    * 6) Ejecución en Mongo: Model.find(filter).skip(...).limit(...).sort(...)
    * 7) Metrics: recordLatency, incrementCounter
    * 8) Cache: cachePluginService.set(key, resultado, TTL)
    * 9) ResponseFormat: devolver { data, total, page, limit, elapsedMs }
    */
    const combinedFilter = { tenantId, ...filter };
    const [data, total] = await Promise.all([
      this.model.find(combinedFilter).sort(sort).skip(skip).limit(limit).exec(),
      this.model.countDocuments(combinedFilter).exec(),
    ]);
    return [data, total];
  }
  
  
  
  async findOne(
    tenantId: string,
    user: any,
    id: string,
  ): Promise<any> {
    /**
    * Flujo:
    * 1) HACL: checkPermission(read)
    * 2) Soft‐delete: softDeleteService.filterDeleted para excluir borrados
    * 3) Cache: intentar leer de cachePluginService.get( key )
    * 4) Model.findOne({ _id, tenantId, deleted:false })
    * 5) Relaciones: populate si corresponde
    * 6) Metrics / Cache / Audit
    */
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID inválido');
    }
    const doc = await this.model.findOne({ _id: id, tenantId }).exec();
    if (!doc) {
      throw new NotFoundException(`Recurso con id=${id} no encontrado`);
    }
    return doc;
  }
  
  async create(
    tenantId: string,
    user: any,
    dto: any,
  ): Promise<any> {
    // Agregar el tenantId en el doc
    /**
    * Flujo:
    * 1) HACL: haclService.checkPermission(tenantId, user, feature.permisos.create)
    * 2) Hooks beforeCreate
    * 3) Validar relaciones: relationsService.validateRelations(...)
    * 4) Ejecutar create en Mongoose con softDelete=false
    * 5) Hooks afterCreate
    * 6) Metrics: metricsService.incrementCounter('entity.create')
    * 7) Cache: invalidar caché de findAll/findOne
    * 8) Audit: auditWrapper.log(...)
    */
    const newDoc = new this.model({ ...dto, tenantId });
    return await newDoc.save();
  }
  
  async update(
    tenantId: string,
    user: any,
    id: string,
    dto: any,
  ): Promise<any> {
    /**
    * Flujo:
    * 1) HACL: checkPermission(update)
    * 2) Hooks beforeUpdate
    * 3) Soft‐delete: verificar que no esté borrado
    * 4) Validar relaciones: relationsService.validateRelations(...)
    * 5) Model.findOneAndUpdate(...)
    * 6) Hooks afterUpdate
    * 7) Metrics / Cache / Audit
    */
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID inválido');
    }
    const updated = await this.model
    .findOneAndUpdate({ _id: id, tenantId }, dto, { new: true })
    .exec();
    if (!updated) {
      throw new NotFoundException(`No se encontró id=${id} para actualizar`);
    }
    return updated;
  }
  
  async delete(
    tenantId: string,
    user: any,
    id: string,
  ): Promise<void> {
    /**
    * Flujo:
    * 1) HACL: checkPermission(delete)
    * 2) Hooks beforeDelete
    * 3) Soft‐delete: si feature.softDelete=true, softDeleteService.applySoftDeleteFlag(...)
    *            sino: Model.deleteOne({ _id, tenantId })
    * 4) Hooks afterDelete
    * 5) Metrics / Cache / Audit
    */
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID inválido');
    }
    const result = await this.model.deleteOne({ _id: id, tenantId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`No se encontró id=${id} para eliminar`);
    }
  }
  
  
  
  // Bulk‐operations
  async bulkCreate(
    tenantId: string,
    user: any,
    dtos: any[],
  ): Promise<any[]> {
    // TODO: ver permiso bulk→ tal vez permisos.create
    throw new Error('BaseCrudService.bulkCreate: not implemented');
  }
  
  async bulkUpdate(
    tenantId: string,
    user: any,
    items: { id: string; dto: any }[],
  ): Promise<any[]> {
    // TODO: ver permiso bulk→ tal vez permisos.update
    throw new Error('BaseCrudService.bulkUpdate: not implemented');
  }
  
  // Import/Export CSV
  async exportCsv(
    tenantId: string,
    user: any,
    filter: any,
  ): Promise<Buffer> {
    throw new Error('BaseCrudService.exportCsv: not implemented');
  }
  
  async importCsv(
    tenantId: string,
    user: any,
    csvBuffer: Buffer,
  ): Promise<void> {
    throw new Error('BaseCrudService.importCsv: not implemented');
  }
}
