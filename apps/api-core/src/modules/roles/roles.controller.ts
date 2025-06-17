// apps/api-core/src/modules/roles/roles.controller.ts

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
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('roles')
@UseGuards(JwtAuthGuard, TenantGuard) 
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /**
   * POST /roles
   * - Sólo usuarios con permiso 'roles.create' pueden acceder.
   */
  @UseGuards(PermissionsGuard)
  @Permissions('roles.create')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() createRoleDto: CreateRoleDto,
  ) {
    const tenantId = tenantIdHeader?.trim() || 'default';
    return await this.rolesService.create(tenantId, createRoleDto);
  }

  /**
   * GET /roles?search=&page=&limit=
   * - Usuarios con permiso 'roles.read'.
   */
  @UseGuards(PermissionsGuard)
  @Permissions('roles.read')
  @Get()
  async findAll(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Query('search') search?: string,
    @Query(
      'page',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    page = 1,
    @Query(
      'limit',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    limit = 10,
  ) {
    const tenantId = tenantIdHeader?.trim() || 'default';
    return await this.rolesService.findAll(tenantId, search, page, limit);
  }

  /**
   * PATCH /roles/:id
   * - Sólo usuarios con permiso 'roles.update'.
   */
  @UseGuards(PermissionsGuard)
  @Permissions('roles.update')
  @Patch(':id')
  async update(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    const tenantId = tenantIdHeader?.trim() || 'default';
    return await this.rolesService.update(tenantId, id, updateRoleDto);
  }

  /**
   * DELETE /roles/:id
   * - Sólo usuarios con permiso 'roles.delete'.
   */
  @UseGuards(PermissionsGuard)
  @Permissions('roles.delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string,
  ) {
    const tenantId = tenantIdHeader?.trim() || 'default';
    await this.rolesService.remove(tenantId, id);
  }
}
