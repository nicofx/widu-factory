// apps/api-core/src/modules/files/file.controller.ts

import {
  Controller,
  Post,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Headers,
  Request,
  Get,
  Param,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { FileService } from './file.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  /**
   * POST /files/upload
   * Recibe multipart/form-data con campo “file”.
   */
  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Headers('x-tenant-id') tenantIdHeader: string,
  ) {
    const tenantId = tenantIdHeader?.trim() || 'default';
    const userId = req.user.userId;
    if (!file) {
      throw new BadRequestException('No se envió ningún archivo.');
    }
    return await this.fileService.uploadFile(
      tenantId,
      userId,
      file.buffer,
      file.originalname,
      file.mimetype,
    );
  }

  /**
   * GET /files/:id
   * Devuelve una URL pre-signed para descargar.
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getFileUrl(
    @Request() req: any,
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string,
  ) {
    const tenantId = tenantIdHeader?.trim() || 'default';
    return await this.fileService.getPresignedUrl(id, tenantId);
  }
}
