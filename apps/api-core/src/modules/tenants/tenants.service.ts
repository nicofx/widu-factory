// apps/api-core/src/modules/tenants/tenants.service.ts

import {
  BadRequestException,
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant } from './schemas/tenant.schema';

@Injectable()
export class TenantsService {
  constructor(
    @InjectModel(Tenant.name) private readonly tenantModel: Model<Tenant>,
  ) {}
  
  /**
  * Verifica si existe un tenant con tenantId dado.
  * Retorna true si lo encuentra, false si no.
  */
  async findById(tenantId: string): Promise<boolean> {
    if (!tenantId || tenantId.trim() === '') {
      throw new BadRequestException('tenantId inválido');
    }
    const existing = await this.tenantModel
    .findOne({ tenantId })
    .exec();
    return existing !== null;
  }
  
  /**
  * Crea un nuevo tenant en base a { tenantId, name }.
  * Si ya existía uno con ese tenantId, lanza ConflictException.
  */
  async create(args: { tenantId: string; name: string }): Promise<Tenant> {
    const { tenantId, name } = args;
    if (!tenantId || tenantId.trim() === '') {
      throw new BadRequestException('El tenantId es obligatorio');
    }
    if (!name || name.trim() === '') {
      throw new BadRequestException('El nombre del tenant es obligatorio');
    }
    
    // Verificar si ya existe
    const exist = await this.tenantModel
    .findOne({ tenantId })
    .exec();
    if (exist) {
      throw new ConflictException(
        `Ya existe un tenant con tenantId "${tenantId}"`,
      );
    }
    
    const newTenant = new this.tenantModel({ tenantId, name });
    return await newTenant.save();
  }
  
  /**
  * Si el tenant no existe, lo crea con los datos básicos.
  * Siempre retorna el documento de tenant.
  */
  async ensureExists(tenantId: string): Promise<Tenant> {
    if (!tenantId || tenantId.trim() === '') {
      throw new BadRequestException('tenantId inválido');
    }
    let tenant = await this.tenantModel.findOne({ tenantId }).exec();
    if (!tenant) {
      tenant = new this.tenantModel({
        tenantId,
        name: tenantId, // Usamos el tenantId como name default, se puede mejorar después
      });
      await tenant.save();
    }
    return tenant;
  }
  
  /**
  * Recupera el documento completo del tenant (para usos futuros).
  */
  async findOneDocument(tenantId: string): Promise<Tenant> {
    if (!tenantId || tenantId.trim() === '') {
      throw new BadRequestException('tenantId inválido');
    }
    const doc = await this.tenantModel
    .findOne({ tenantId })
    .exec();
    if (!doc) {
      throw new NotFoundException(`Tenant "${tenantId}" no existe`);
    }
    return doc;
  }
}
