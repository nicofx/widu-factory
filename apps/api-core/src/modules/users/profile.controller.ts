// apps/api-core/src/modules/users/profile.controller.ts

import { Controller, UseGuards, Request, Headers, Put, Body, Get, Patch, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileService } from './profile.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from '../files/file.service';
import { UpdateAvatarResponseDto } from './dto/user-avatar-response-dto';
import { UsersService } from './users.service';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly fileService: FileService,
    private readonly usersService: UsersService,
  ) {}
  
  @UseGuards(JwtAuthGuard)
  @Put('/me')
  async updateProfile(
    @Request() req: any,
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() dto: UpdateProfileDto,
  ) {
    const userId = req.user._id?.toString() ?? req.user.userId;
    const tenantId = tenantIdHeader?.trim() || 'default';
    return await this.profileService.updateProfile(userId, tenantId, dto);
  }
  
  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async getProfile(
    @Request() req: any,
    @Headers('x-tenant-id') tenantIdHeader: string,
  ) {
    const userId = req.user._id?.toString() ?? req.user.userId;
    const tenantId = tenantIdHeader?.trim() || 'default';
    return await this.profileService.getProfile(userId, tenantId);
  }
  
  /**
  * PATCH /profile/avatar
  * Actualiza el avatar del usuario actual.
  */
  @Patch('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Headers('x-tenant-id') tenantIdHeader: string,
  ): Promise<UpdateAvatarResponseDto> {
    const tenantId = tenantIdHeader?.trim() || 'default';
    const userId = req.user.userId;
    if (!file) throw new BadRequestException('No se envió ningún archivo.');
    
    // 1. Subir archivo (usa tu FileService)
    const meta = await this.fileService.uploadFile(
      tenantId, userId, file.buffer, file.originalname, file.mimetype
    );
    
    // 2. Actualizar avatarUrl del usuario
    await this.usersService.updateAvatar(userId, tenantId, meta.url);
    
    return { avatarUrl: meta.url };
  }
  
}
