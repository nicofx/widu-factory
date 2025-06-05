// src/crud-magic/services/bulk-ops.service.ts

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types, Model } from 'mongoose';

/**
 * BulkOpsService
 *
 * - bulkCreate: inserta múltiples documentos de una sola vez (insertMany)
 * - bulkUpdate: actualiza múltiples documentos de una sola vez (bulkWrite)
 *
 * Adaptado para no usar `UpdateOneModel`, sino operaciones tipadas como `any`.
 */
@Injectable()
export class BulkOpsService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
  ) {}

  /**
   * bulkCreate:
   *  1) Verifica que `dtos` sea un arreglo no vacío.
   *  2) Obtiene el Model dinámico con `connection.model(entityName)`.
   *  3) Agrega `tenantId` y `deleted: false` a cada DTO.
   *  4) Llama a `model.insertMany(...)`.
   *  5) Devuelve el arreglo de documentos creados.
   */
  async bulkCreate(
    tenantId: string,
    user: any,
    entityName: string,
    dtos: any[],
  ): Promise<any[]> {
    if (!Array.isArray(dtos) || dtos.length === 0) {
      throw new BadRequestException('bulkCreate: el cuerpo debe ser un array no vacío');
    }

    const model: Model<any> = this.connection.model(entityName);

    const docsToInsert = dtos.map(dto => ({
      ...dto,
      tenantId,
      deleted: false,
    }));

    const insertedDocs = await model.insertMany(docsToInsert);
    return insertedDocs;
  }

  /**
   * bulkUpdate:
   *  1) Verifica que `items` sea un arreglo no vacío de { id, dto }.
   *  2) Obtiene el Model dinámico con `connection.model(entityName)`.
   *  3) Para cada { id, dto }:
   *      - Valida que `id` sea un ObjectId válido.
   *      - Construye una operación genérica `{ updateOne: { filter: { _id, tenantId }, update: { $set: dto } } }`.
   *  4) Llama a `model.bulkWrite(operations, { ordered: false })`.
   *  5) Si no se modificó ningún documento, lanza NotFoundException.
   *  6) Recupera con `find({ _id: { $in: ids }, tenantId })` los documentos actualizados.
   *  7) Devuelve ese arreglo.
   */
  async bulkUpdate(
    tenantId: string,
    user: any,
    entityName: string,
    items: { id: string; dto: any }[],
  ): Promise<any[]> {
    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestException('bulkUpdate: el cuerpo debe ser un array de { id, dto }');
    }

    const model: Model<any> = this.connection.model(entityName);
    const operations: any[] = [];

    for (const { id, dto } of items) {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`bulkUpdate: id inválido ${id}`);
      }
      operations.push({
        updateOne: {
          filter: { _id: id, tenantId },
          update: { $set: dto },
        },
      });
    }

    const result = await model.bulkWrite(operations, { ordered: false });

    // Si no se actualizó ningún documento, arrojamos NotFoundException
    if (result.nModified === 0 && result.nMatched === 0) {
      // Para versiones antiguas de Mongoose se usan nModified/nMatched en lugar de matchedCount/modifiedCount
      throw new NotFoundException('bulkUpdate: ningún documento fue encontrado o modificado');
    }

    const ids = items.map(item => item.id);
    const updatedDocs = await model.find({ _id: { $in: ids }, tenantId }).exec();
    return updatedDocs;
  }
}
