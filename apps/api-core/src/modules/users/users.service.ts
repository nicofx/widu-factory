// apps/api-core/src/modules/users/users.service.ts

import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

// Usamos crypto scrypt en lugar de bcrypt
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MailerService } from '../../common/mailer/mailer.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

// Convertimos la versión callback de scrypt a una que devuelve promise
const scrypt = promisify(_scrypt);

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  
  /**
  * Crear un nuevo usuario bajo un tenant dado.
  * @param tenantId — Identificador del tenant (viene del header 'x-tenant-id').
  * @param createUserDto — Data mínima para crear un usuario.
  * @returns El usuario creado, sin el campo passwordHash.
  */
  async create(tenantId: string, createUserDto: CreateUserDto): Promise<User> {
    // 1) validar si ya existe correo
    const exists = await this.userModel.findOne({ tenantId, email: createUserDto.email });
    if (exists) throw new ConflictException('Email ya registrado.');
    
    // 2) generar salt + hash y guardarlo
    const salt = randomBytes(8).toString('hex');
    const derivedKey = (await scrypt(createUserDto.password, salt, 64)) as Buffer;
    const passwordHash = `${salt}:${derivedKey.toString('hex')}`;
    
    const newUser = new this.userModel({
      tenantId,
      email: createUserDto.email,
      passwordHash,
      roles: createUserDto.roles || [],
      plan: createUserDto.plan || null,
      metadata: createUserDto.metadata || {},
    });
    const savedUser = await newUser.save();
    
    // 3) generar token JWT para verificación (payload mínimo)
    const payload = {
      sub: savedUser._id.toString(),
      tenantId: savedUser.tenantId,
      email: savedUser.email,
    };
    const expiresIn = this.configService.get<string>('EMAIL_TOKEN_EXPIRES_IN') || '24h';
    const verificationToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn,
    });
    
    // 4) enviar correo de verificación
    await this.mailerService.sendVerificationEmail(
      tenantId,
      savedUser.email,
      savedUser.metadata?.name || savedUser.email,
      verificationToken,
    );
    
    // 5) retornar usuario sin passwordHash
    const { passwordHash: _passwordHash, ...userObj } = savedUser.toObject();
    return userObj as any;
  }
  
  
  /**
  * Obtener un solo usuario por ID, validando tenantId.
  * No expone passwordHash.
  */
  async findOne(
    tenantId: string,
    id: string,
  ): Promise<Partial<User>> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de usuario inválido');
    }
    // Buscamos documento con matching de id + tenantId
    const user = await this.userModel
    .findOne({ _id: id, tenantId })
    .select('-passwordHash')
    .exec();
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado en este tenant.`);
    }
    return user.toObject();
  }
  
  /**
  * Actualizar datos (email, contraseña, metadata) de un usuario en un tenant.
  * Si cambia el email, validamos duplicado dentro del mismo tenant.
  * Si cambia contraseña, re-hasheamos con scrypt+salt.
  */
  async update(
    tenantId: string,
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Partial<User>> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de usuario inválido');
    }
    // Verificamos que el usuario exista y pertenezca al tenantId
    const user = await this.userModel
    .findOne({ _id: id, tenantId })
    .exec();
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado en este tenant.`);
    }
    
    // 1) Si se cambia email, validar que no exista en este tenant
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existe = await this.userModel
      .findOne({ tenantId, email: updateUserDto.email })
      .exec();
      if (existe) {
        throw new ConflictException(
          `El email "${updateUserDto.email}" ya está registrado en este tenant.`,
        );
      }
      user.email = updateUserDto.email;
    }
    
    // 2) Si se cambia contraseña, generar nuevo salt+hash
    if (updateUserDto.password) {
      const newSalt = randomBytes(16).toString('hex');
      const newDerivedKey = (await scrypt(updateUserDto.password, newSalt, 64)) as Buffer;
      user.passwordHash = `${newSalt}:${newDerivedKey.toString('hex')}`;
    }
    
    // 3) Actualizar metadata (name, phone, avatarUrl)
    user.metadata = {
      ...user.metadata,
      ...(updateUserDto.name !== undefined && { name: updateUserDto.name }),
      ...(updateUserDto.phone !== undefined && { phone: updateUserDto.phone }),
      ...(updateUserDto.avatarUrl !== undefined && { avatarUrl: updateUserDto.avatarUrl }),
    };
    
    const updated = await user.save();
    const { passwordHash: _, ...result } = updated.toObject();
    return result;
  }
  
  /**
  * Eliminar un usuario en un tenant. Realiza borrado físico.
  */
  async remove(
    tenantId: string,
    id: string,
  ): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de usuario inválido');
    }
    const user = await this.userModel
    .findOne({ _id: id, tenantId })
    .exec();
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado en este tenant.`);
    }
    await this.userModel.deleteOne({ _id: id, tenantId }).exec();
  }
  
  /**
  * Agrega un rol (roleId) a un usuario. Ambos deben pertenecer al mismo tenant.
  */
  async addRole(
    tenantId: string,
    userId: string,
    roleId: string,
  ): Promise<void> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(roleId)) {
      throw new BadRequestException('ID inválido (usuario o rol)');
    }
    // Verificamos que el usuario exista en este tenant
    const user = await this.userModel
    .findOne({ _id: userId, tenantId })
    .exec();
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${userId}" no encontrado en este tenant.`);
    }
    // Comprobar que no esté ya asignado
    const already = user.roles?.find(r => r.toString() === roleId);
    if (already) {
      throw new ConflictException(`El usuario ya tiene asignado ese rol.`);
    }
    user.roles?.push(new Types.ObjectId(roleId));
    await user.save();
  }
  
  /**
  * Quita un rol (roleId) de un usuario en este tenant.
  */
  async removeRole(
    tenantId: string,
    userId: string,
    roleId: string,
  ): Promise<void> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(roleId)) {
      throw new BadRequestException('ID inválido (usuario o rol)');
    }
    const user = await this.userModel
    .findOne({ _id: userId, tenantId })
    .exec();
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${userId}" no encontrado en este tenant.`);
    }
    user.roles = user.roles?.filter(r => r.toString() !== roleId);
    await user.save();
  }
  
  /**
  * Asigna un plan (planId) a un usuario en este tenant.
  */
  async setPlan(
    tenantId: string,
    userId: string,
    planId: string,
  ): Promise<void> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(planId)) {
      throw new BadRequestException('ID inválido (usuario o plan)');
    }
    const user = await this.userModel
    .findOne({ _id: userId, tenantId })
    .exec();
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${userId}" no encontrado en este tenant.`);
    }
    user.plan = new Types.ObjectId(planId);
    await user.save();
  }
  
  /**
  * Método de utilidad para AuthModule: buscar usuario por email+tenantId
  * (necesario para validar credenciales)
  */
  async findByEmail(
    tenantId: string,
    email: string,
  ): Promise<User | null> {
    return this.userModel.findOne({ tenantId, email }).exec();
  }
  
  async getRoles(tenantId: string, userId: string): Promise<string[]> {
    const user = await this.userModel
    .findOne({ _id: userId, tenantId })
    .select('roles')
    .exec();
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${userId}" no encontrado en este tenant.`);
    }
    // Devolver array de roleIds como strings
    return user.roles.map((r) => r.toString());
  }
  
  /**
  * Listar usuarios de un tenant específico, con paginación.
  * @param tenantId — Tenant actual.
  * @param page — Página (1-based).
  * @param limit — Cantidad por página.
  */
  async findAll(
    tenantId: string,
    page = 1,
    limit = 10,
    searchTerm?: string,
  ): Promise<{ data: Partial<User>[]; total: number }> {
    const skip = (page - 1) * limit;
    // Construir filtro base
    const filter: any = { tenantId };
    if (searchTerm && searchTerm.trim() !== '') {
      // Buscamos en email o metadata.name usando regex
      filter.$or = [
        { email: { $regex: searchTerm, $options: 'i' } },
        { 'metadata.name': { $regex: searchTerm, $options: 'i' } },
      ];
    }
    
    const [data, total] = await Promise.all([
      this.userModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .select('-passwordHash')
      .exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);
    return { data, total };
  }
  
  async updatePassword(
    tenantId: string,
    userId: string,
    newPasswordHash: string,
  ): Promise<void> {
    const result = await this.userModel.updateOne(
      { _id: userId, tenantId },
      { passwordHash: newPasswordHash },
    );
    if (result.matchedCount === 0) {
      throw new NotFoundException('Usuario no encontrado.');
    }
  }
}
