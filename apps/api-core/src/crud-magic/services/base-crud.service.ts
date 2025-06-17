import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { EntityFeature } from '../interfaces/entity-feature.interface';
import { FilteringService } from './filtering.service';
import { HaclService } from './hacl.service';
import { SoftDeleteService } from './soft-delete.service';
import { RelationsService } from './relations.service';
import { ImportExportService } from './import-export.service';
import { BulkOpsService } from './bulk-ops.service';
import { I18nService } from './i18n.service';
import { MetricsService } from './metrics.service';
import { HooksService } from './hooks.service';

/**
* BaseCrudService
*
* Implementa los métodos CRUD básicos usando:
*  - HaclService para permisos
*  - FilteringService para filtros
*  - SoftDeleteService para soft-delete
*  - RelationsService para populate
*  - MetricsService para métricas simples
*  - HooksService para invocar hooks before/after
*
* Los parámetros del constructor vienen inyectados desde CrudMagicModule.forFeature:
*   [Model<Mongoose>, entityName, feature, filteringService, haclService, softDeleteService,
*    relationsService, importExportService, bulkOpsService, i18nService, metricsService, hooksService]
*/
@Injectable()
export class BaseCrudService {
  constructor(
    private readonly model: Model<any>,              // Model de Mongoose inyectado
    private readonly entityName: string,              // Ej: "Project"
    private readonly feature: EntityFeature,          // Definición (schema, permisos, soft-delete, relaciones, etc.)
    private readonly filteringService: FilteringService,
    private readonly haclService: HaclService,
    private readonly softDeleteService: SoftDeleteService,
    private readonly relationsService: RelationsService,
    private readonly importExportService: ImportExportService,
    private readonly bulkOpsService: BulkOpsService,
    private readonly i18nService: I18nService,
    private readonly metricsService: MetricsService,
    private readonly hooksService: HooksService,
  ) {}
  
  /**
  * findAll:
  * 1) HACL: verificar 'entityName.read'
  * 2) Filtros: incluir tenantId + filterCriteria
  * 3) Soft-delete: aplicar softDeleteService.filterDeleted
  * 4) Populate relaciones default
  * 5) Contar y recuperar documentos con skip, limit, sort
  * 6) Métricas: medir latencia e incrementar contador
  * 7) Retornar [data, total]
  */
 async findAll(
    tenantId: string,
    user: any,
    filterCriteria: Record<string, any>,
    sortCriteria: Record<string, 1 | -1>,
    skip: number,
    limit: number,
  ): Promise<[any[], number]> {
    // 1) HACL
    await this.haclService.checkPermission(
      tenantId,
      user,
      `${this.entityName.toLowerCase()}.read`,
    );

    // 2) Combinar filtros + soft-delete
    let finalFilter: any = { tenantId, ...filterCriteria };
    if (this.feature.softDelete) {
      finalFilter = this.softDeleteService.filterDeleted(
        tenantId,
        this.entityName,
        finalFilter,
      );
    }

    // 3) Construir la consulta
    let queryBuilder = this.model.find(finalFilter);

    // 4) Si hay relaciones para popular, invocar applyPopulate **con 6 argumentos**:
    if (
      Array.isArray(this.feature.relationsPopulateDefault) &&
      this.feature.relationsPopulateDefault.length > 0
    ) {
      queryBuilder = this.relationsService.applyPopulate(
        tenantId,                                  // 1) tenantId
        user,                                      // 2) user
        this.entityName,                           // 3) entityName
        queryBuilder,                              // 4) queryBuilder (Query<any, any>)
        this.feature.relationsPopulateDefault,     // 5) populateFields
        this.feature,                              // 6) feature (EntityFeature)
      );
    }

    // 5) Aplicar sort, skip, limit
    queryBuilder = queryBuilder.sort(sortCriteria).skip(skip).limit(limit);

    // 6) Ejecutar consulta y conteo en paralelo
    const start = Date.now();
    const [data, total] = await Promise.all([
      queryBuilder.exec(),
      this.model.countDocuments(finalFilter).exec(),
    ]);
    const elapsedMs = Date.now() - start;

    // 7) Métricas
    this.metricsService.incrementCounter(`${this.entityName}.read`);
    this.metricsService.recordLatency(`${this.entityName}.read`, elapsedMs);

    return [data, total];
  }
  
  /**
  * findOne:
  * 1) Validar ID
  * 2) HACL: verificar 'entityName.read'
  * 3) Filtro: { _id:id, tenantId } + soft-delete
  * 4) Populate relaciones default
  * 5) Si no existe, NotFoundException
  * 6) Métricas y retornar
  */
  async findOne(
    tenantId: string,
    user: any,
    id: string,
  ): Promise<any> {
    // 1) Validar ID
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID inválido');
    }

    // 2) HACL
    await this.haclService.checkPermission(
      tenantId,
      user,
      `${this.entityName.toLowerCase()}.read`,
    );

    // 3) Filtro base + soft-delete
    let finalFilter: any = { _id: id, tenantId };
    if (this.feature.softDelete) {
      finalFilter = this.softDeleteService.filterDeleted(
        tenantId,
        this.entityName,
        finalFilter,
      );
    }

    // 4) Construir consulta
    let queryBuilder = this.model.findOne(finalFilter);

    // 5) Si hay relaciones para popular, invocar applyPopulate **con 6 argumentos**:
    if (
      Array.isArray(this.feature.relationsPopulateDefault) &&
      this.feature.relationsPopulateDefault.length > 0
    ) {
      queryBuilder = this.relationsService.applyPopulate(
        tenantId,                                  // 1) tenantId
        user,                                      // 2) user
        this.entityName,                           // 3) entityName
        queryBuilder,                              // 4) queryBuilder (Query<any, any>)
        this.feature.relationsPopulateDefault,     // 5) populateFields
        this.feature,                              // 6) feature (EntityFeature)
      );
    }

    // 6) Ejecutar consulta
    const start = Date.now();
    const doc = await queryBuilder.exec();
    const elapsedMs = Date.now() - start;

    if (!doc) {
      throw new NotFoundException(
        `${this.entityName} con id=${id} no encontrado`,
      );
    }

    // 7) Métricas
    this.metricsService.incrementCounter(`${this.entityName}.readOne`);
    this.metricsService.recordLatency(`${this.entityName}.readOne`, elapsedMs);

    return doc;
  }
  
  /**
  * create:
  * 1) HACL: 'entityName.create'
  * 2) Hooks beforeCreate
  * 3) Validar relaciones (si hay)
  * 4) new this.model({...dto, tenantId, deleted:false})
  * 5) Guardar en BD
  * 6) Hooks afterCreate
  * 7) Métricas
  * 8) Retornar nuevo documento
  */
  async create(
    tenantId: string,
    user: any,
    dto: any,
  ): Promise<any> {
    // 1) HACL
    await this.haclService.checkPermission(
      tenantId,
      user,
      `${this.entityName.toLowerCase()}.create`,
    );

    // 2) Hooks beforeCreate
    await this.hooksService.executeHooks(this.entityName, 'beforeCreate', {
      tenantId,
      user,
      dto,
    });

    // 3) Validar relaciones **con 5 argumentos**:
    if (Array.isArray(this.feature.relaciones) && this.feature.relaciones.length) {
      await this.relationsService.validateRelations(
        tenantId,        // 1) tenantId
        user,            // 2) user
        this.entityName, // 3) entityName
        dto,             // 4) relationsInBody (el DTO completo o los campos que contengan IDs relacionales)
        this.feature,    // 5) feature (EntityFeature)
      );
    }

    // 4) Crear documento en BD
    const newDoc = new this.model({ ...dto, tenantId, deleted: false });
    const start = Date.now();
    const saved = await newDoc.save();
    const elapsedMs = Date.now() - start;

    // 5) Hooks afterCreate
    await this.hooksService.executeHooks(this.entityName, 'afterCreate', {
      tenantId,
      user,
      newDoc: saved,
    });

    // 6) Métricas
    this.metricsService.incrementCounter(`${this.entityName}.create`);
    this.metricsService.recordLatency(`${this.entityName}.create`, elapsedMs);

    return saved;
  }
  
  /**
  * update:
  * 1) Validar ID
  * 2) HACL: 'entityName.update'
  * 3) Hooks beforeUpdate
  * 4) Validar relaciones si hay
  * 5) this.model.findOneAndUpdate({ _id:id, tenantId }, dto, { new: true })
  * 6) Si no existe o está eliminado, NotFoundException
  * 7) Hooks afterUpdate
  * 8) Métricas
  * 9) Retornar actualizado
  */

  async update(
    tenantId: string,
    user: any,
    id: string,
    dto: any,
  ): Promise<any> {
    // 1) Validar ID
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID inválido');
    }

    // 2) HACL
    await this.haclService.checkPermission(
      tenantId,
      user,
      `${this.entityName.toLowerCase()}.update`,
    );

    // 3) Hooks beforeUpdate
    await this.hooksService.executeHooks(this.entityName, 'beforeUpdate', {
      tenantId,
      user,
      id,
      dto,
    });

    // 4) Validar relaciones **con 5 argumentos**:
    if (Array.isArray(this.feature.relaciones) && this.feature.relaciones.length) {
      await this.relationsService.validateRelations(
        tenantId,        // 1) tenantId
        user,            // 2) user
        this.entityName, // 3) entityName
        dto,             // 4) relationsInBody
        this.feature,    // 5) feature
      );
    }

    // 5) Actualizar en BD
    const start = Date.now();
    const updated = await this.model
      .findOneAndUpdate({ _id: id, tenantId }, dto, { new: true })
      .exec();
    const elapsedMs = Date.now() - start;

    if (!updated) {
      throw new NotFoundException(
        `${this.entityName} con id=${id} no encontrado o está eliminado`,
      );
    }

    // 6) Hooks afterUpdate
    await this.hooksService.executeHooks(this.entityName, 'afterUpdate', {
      tenantId,
      user,
      updated,
    });

    // 7) Métricas
    this.metricsService.incrementCounter(`${this.entityName}.update`);
    this.metricsService.recordLatency(`${this.entityName}.update`, elapsedMs);

    return updated;
  }
  
  /**
  * delete:
  * 1) Validar ID
  * 2) HACL: 'entityName.delete'
  * 3) Hooks beforeDelete
  * 4) Si feature.softDelete: softDeleteService.applySoftDeleteFlag
  *    Sino: this.model.deleteOne({ _id:id, tenantId })
  * 5) Si no afectó, NotFoundException
  * 6) Hooks afterDelete
  * 7) Métricas
  */
  async delete(
    tenantId: string,
    user: any,
    id: string,
  ): Promise<void> {
    // 1) Validar ID
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID inválido');
    }
    
    // 2) HACL
    await this.haclService.checkPermission(
      tenantId,
      user,
      `${this.entityName.toLowerCase()}.delete`,
    );
    
    // 3) Hooks beforeDelete
    await this.hooksService.executeHooks(this.entityName, 'beforeDelete', {
      tenantId,
      user,
      id,
    });
    
    // 4) Soft-delete o delete físico
    if (this.feature.softDelete) {
      await this.softDeleteService.applySoftDeleteFlag(tenantId, this.entityName, id);
    } else {
      const result = await this.model.deleteOne({ _id: id, tenantId }).exec();
      if (result.deletedCount === 0) {
        throw new NotFoundException(`${this.entityName} con id=${id} no encontrado`);
      }
    }
    
    // 5) Hooks afterDelete
    await this.hooksService.executeHooks(this.entityName, 'afterDelete', {
      tenantId,
      user,
      id,
    });
    
    // 6) Métricas
    this.metricsService.incrementCounter(`${this.entityName}.delete`);
    // No medimos latencia en delete (opcional)
  }
  
  // Bulk & CSV se implementarán en sprints posteriores
/**
   * bulkCreate:
   *  1) HACL: permiso "<entityName>.create"
   *  2) Hooks beforeBulkCreate (si aplica)
   *  3) Delegar a BulkOpsService
   *  4) Hooks afterBulkCreate (si aplica)
   *  5) Métricas: contador y latencia
   */
  async bulkCreate(
    tenantId: string,
    user: any,
    dtos: any[],
  ): Promise<any[]> {
    // 1) Permiso HACL
    await this.haclService.checkPermission(
      tenantId,
      user,
      `${this.entityName.toLowerCase()}.create`,
    );

    // 2) Hooks beforeBulkCreate (opcional, si definiste uno)
    await this.hooksService.executeHooks(this.entityName, 'beforeBulkCreate', {
      tenantId,
      user,
      dtos,
    });

    // 3) Bulk-insert
    const start = Date.now();
    const created = await this.bulkOpsService.bulkCreate(
      tenantId,
      user,
      this.entityName,
      dtos,
    );
    const elapsedMs = Date.now() - start;

    // 4) Hooks afterBulkCreate (opcional)
    await this.hooksService.executeHooks(this.entityName, 'afterBulkCreate', {
      tenantId,
      user,
      created,
    });

    // 5) Métricas
    this.metricsService.incrementCounter(`${this.entityName}.bulkCreate`);
    this.metricsService.recordLatency(`${this.entityName}.bulkCreate`, elapsedMs);

    return created;
  }

  /**
   * bulkUpdate:
   *  1) HACL: permiso "<entityName>.update"
   *  2) Hooks beforeBulkUpdate
   *  3) Delegar a BulkOpsService
   *  4) Hooks afterBulkUpdate
   *  5) Métricas: contador y latencia
   */
  async bulkUpdate(
    tenantId: string,
    user: any,
    items: { id: string; dto: any }[],
  ): Promise<any[]> {
    // 1) Permiso HACL
    await this.haclService.checkPermission(
      tenantId,
      user,
      `${this.entityName.toLowerCase()}.update`,
    );

    // 2) Hooks beforeBulkUpdate (opcional)
    await this.hooksService.executeHooks(this.entityName, 'beforeBulkUpdate', {
      tenantId,
      user,
      items,
    });

    // 3) Bulk-update
    const start = Date.now();
    const updated = await this.bulkOpsService.bulkUpdate(
      tenantId,
      user,
      this.entityName,
      items,
    );
    const elapsedMs = Date.now() - start;

    // 4) Hooks afterBulkUpdate (opcional)
    await this.hooksService.executeHooks(this.entityName, 'afterBulkUpdate', {
      tenantId,
      user,
      updated,
    });

    // 5) Métricas
    this.metricsService.incrementCounter(`${this.entityName}.bulkUpdate`);
    this.metricsService.recordLatency(`${this.entityName}.bulkUpdate`, elapsedMs);

    return updated;
  }
  
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
