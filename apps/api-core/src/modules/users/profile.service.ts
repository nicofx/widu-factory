// apps/api-core/src/modules/users/profile.service.ts

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './schemas/user.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FileMeta } from '../files/schemas/file.schema';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(FileMeta.name) private readonly fileMetaModel: Model<FileMeta>,
  ) {}
  
  async updateProfile(userId: string, tenantId: string, dto: UpdateProfileDto) {
    // Validar avatar si viene
    if (dto.avatar) {
      const meta = await this.fileMetaModel.findOne({ _id: dto.avatar, tenantId });
      if (!meta) throw new BadRequestException('El avatar especificado no existe o no es válido.');
    }
    const updated = await this.userModel.findOneAndUpdate(
      { _id: userId, tenantId },
      { $set: { ...dto } },
      { new: true },
    );
    if (!updated) throw new NotFoundException('Usuario no encontrado.');
    return updated;
  }
  
  async getProfile(userId: string, tenantId: string) {
    return await this.userModel.findOne({ _id: userId, tenantId });
  }
  
  /**
  * Devuelve el perfil mixto del usuario (para /profile/me).
  * Si querés, podés hacer select sólo de los campos necesarios.
  */
  async getUserProfile(userId: string, tenantId: string): Promise<UserProfileResponseDto> {
    // Acá te asegurás que el tipo devuelto es User
    const user = await this.userModel.findOne({ _id: userId, tenantId }).lean<User>();
    if (!user) throw new NotFoundException('Usuario no encontrado.');
    
    return {
      email: user.email,
      name: user.name,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
    };
  }
}
