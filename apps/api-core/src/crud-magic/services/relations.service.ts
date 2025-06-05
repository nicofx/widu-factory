// crud-magic/src/services/relations.service.ts

import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types, Model } from 'mongoose';
import { HaclService } from './hacl.service';
import { EntityFeature } from '../interfaces/entity-feature.interface';

/**
 * RelationsService
 *
 * - validateRelations(): valida que cada campo relacional:
 *     • esté definido en feature.relaciones
 *     • sea un ObjectId válido
 *     • exista el documento con tenantId en la colección indicada
 *     • (si se definió permisoLeer) el usuario tenga permiso para leerlo
 *
 * - applyPopulate(): recorre populateFields y, antes de
 *   llamar a `.populate(campo)`, si en feature.relaciones
 *   existe un permisoLeer para ese campo, invoca HaclService.checkPermission.
 *   Si falla, lanza ForbiddenException. Si pasa, hace `.populate(campo)`.
 */
@Injectable()
export class RelationsService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly haclService: HaclService,
  ) {}

  /**
   * validateRelations:
   *
   * @param tenantId        - Identificador del tenant (header 'x-tenant-id')
   * @param user            - Objeto user (payload JWT) con user.roles y user.userId
   * @param entityName      - Nombre de la entidad principal (ej. "Project")
   * @param relationsInBody - Objeto con campos relacionales y sus IDs:
   *                          { campoRelacional: "<ObjectId>", ... }
   * @param feature         - EntityFeature de la entidad principal
   *
   * Para cada par [campo, valor]:
   *  1) Si no existe feature.relaciones, retorna sin hacer nada.
   *  2) Busca relDef = feature.relaciones.find(r => r.campo === campo).
   *     Si no existe, ignora ese campo.
   *  3) Valida que valor sea ObjectId válido. Si no, BadRequestException.
   *  4) Obtiene modelName = relDef.model. Intenta connection.model(modelName).
   *     Si no existe, BadRequestException.
   *  5) Hace findOne({ _id: valor, tenantId }). Si no existe, NotFoundException.
   *  6) Si relDef.permisoLeer existe, invoca:
   *       await this.haclService.checkPermission(tenantId, user, relDef.permisoLeer);
   *     Si falla, lanza ForbiddenException.
   */
  async validateRelations(
    tenantId: string,
    user: any,
    entityName: string,
    relationsInBody: Record<string, any>,
    feature?: EntityFeature,
  ): Promise<void> {
    if (
      !relationsInBody ||
      typeof relationsInBody !== 'object' ||
      !feature?.relaciones
    ) {
      return;
    }

    for (const [campo, valor] of Object.entries(relationsInBody)) {
      if (valor == null) {
        // Si es null/undefined, saltar
        continue;
      }

      // 1) Buscar la definición de la relación en feature.relaciones
      const relDef = feature.relaciones.find((r) => r.campo === campo);
      if (!relDef) {
        // Si no está definido, ignorar
        continue;
      }

      // 2) Validar que valor sea ObjectId válido
      if (!Types.ObjectId.isValid(valor)) {
        throw new BadRequestException(
          `RelationsService: el campo relacional "${campo}" debe ser un ObjectId válido`,
        );
      }

      // 3) Obtener el modelo relacionado
      const modelName = relDef.model;
      let relModel: Model<any>;
      try {
        relModel = this.connection.model(modelName);
      } catch {
        throw new BadRequestException(
          `RelationsService: modelo relacionado "${modelName}" no encontrado para el campo "${campo}"`,
        );
      }

      // 4) Verificar existencia de documento con tenantId
      const doc = await relModel
        .findOne({ _id: valor, tenantId })
        .exec();
      if (!doc) {
        throw new NotFoundException(
          `RelationsService: no se encontró ${modelName} con id=${valor} para el campo "${campo}"`,
        );
      }

      // 5) Si existe permisoLeer en la definición, verificarlo
      if (relDef.permisoLeer) {
        await this.haclService.checkPermission(
          tenantId,
          user,
          relDef.permisoLeer,
        );
      }
    }
  }

  /**
   * applyPopulate:
   *
   * @param tenantId       - Identificador del tenant
   * @param user           - Objeto user (payload JWT)
   * @param entityName     - Nombre de la entidad principal
   * @param queryBuilder   - Mongoose Query (find() o findOne())
   * @param populateFields - Array de nombres de campos a popular
   * @param feature        - EntityFeature de la entidad principal
   *
   * Si populateFields no es arreglo o está vacío, devuelve queryBuilder sin cambios.
   * Para cada campo en populateFields:
   *  1) Busca relDef = feature.relaciones.find(r => r.campo === campo).
   *     Si no existe, lo ignora y sigue.
   *  2) Si relDef.permisoLeer existe, invoca HaclService.checkPermission.
   *     Si falta permiso, lanza ForbiddenException.
   *  3) Si todo ok, hace queryBuilder = queryBuilder.populate(campo).
   * Devuelve el queryBuilder final.
   */
  applyPopulate(
    tenantId: string,
    user: any,
    entityName: string,
    queryBuilder: any,
    populateFields?: string[],
    feature?: EntityFeature,
  ): any {
    if (
      !Array.isArray(populateFields) ||
      populateFields.length === 0 ||
      !feature?.relaciones
    ) {
      return queryBuilder;
    }

    for (const campo of populateFields) {
      if (typeof campo !== 'string' || campo.trim() === '') {
        continue;
      }

      // 1) Buscar definición de la relación
      const relDef = feature.relaciones.find((r) => r.campo === campo);
      if (!relDef) {
        // Si no está definido, ignorar
        continue;
      }

      // 2) Si hay permisoLeer, verificarlo
      if (relDef.permisoLeer) {
        // Si falla, throw ForbiddenException
        // (checkPermission lanza ForbiddenException si falta el permiso)
        throw new ForbiddenException(
          `No tienes permiso "${relDef.permisoLeer}" para popular "${campo}"`,
        );
      }

      // 3) Aplicar populate
      queryBuilder = queryBuilder.populate(campo.trim());
    }

    return queryBuilder;
  }
}
