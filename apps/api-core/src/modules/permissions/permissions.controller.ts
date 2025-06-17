// apps/api-core/src/modules/permissions/permissions.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  HttpCode,
  HttpStatus,
  Headers,
  Query,
  ParseIntPipe
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  /**
   * Crear un nuevo permiso en este tenant.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() createDto: CreatePermissionDto,
  ) {
    const tenantId = tenantIdHeader?.trim() || 'default';
    return await this.permissionsService.create(tenantId, createDto);
  }

  /**
   * Listar todos los permisos en este tenant.
   */
  @Get()
  async findAll(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Query('search') search?: string,
    @Query('page', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) page = 1,
    @Query('limit', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) limit = 10,
  ) {
    const tenantId = tenantIdHeader?.trim() || 'default';
    return await this.permissionsService.findAll(tenantId, search, page, limit);
  }
  /**
   * Obtener un permiso por ID (en este tenant).
   */
  @Get(':id')
  async findOne(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string,
  ) {
    const tenantId = tenantIdHeader?.trim() || 'default';
    return await this.permissionsService.findOne(tenantId, id);
  }

  /**
   * Actualizar un permiso (renombrar o cambiar descripción).
   */
  @Patch(':id')
  async update(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string,
    @Body() updateDto: UpdatePermissionDto,
  ) {
    const tenantId = tenantIdHeader?.trim() || 'default';
    return await this.permissionsService.update(tenantId, id, updateDto);
  }

  /**
   * Borrar un permiso (hard delete) en este tenant.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string,
  ) {
    const tenantId = tenantIdHeader?.trim() || 'default';
    await this.permissionsService.remove(tenantId, id);
  }
}
