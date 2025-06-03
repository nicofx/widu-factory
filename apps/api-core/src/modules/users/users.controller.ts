// apps/api-core/src/modules/users/users.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  HttpCode,
  HttpStatus,
  Headers,
  Request,
  ForbiddenException,
  UseGuards,
  Query
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Crear nuevo usuario:
   * Sólo rol 'admin' puede hacerlo.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() createUserDto: CreateUserDto,
  ) {
    const tenantId = tenantIdHeader?.trim() || 'default';
    return await this.usersService.create(tenantId, createUserDto);
  }

  /**
   * Listar usuarios:
   * Puede hacerlo 'admin' o 'manager'.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @Get()
  async findAll(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Query('page', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) page = 1,
    @Query('limit', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) limit = 10,
    @Query('search') search?: string,
  ) {
    const tenantId = tenantIdHeader?.trim() || 'default';
    return await this.usersService.findAll(tenantId, page, limit, search);
  }
  
  /**
   * Obtener usuario por ID:
   * Puede verlo 'admin' o el propio usuario (comparar userId).
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  async findOne(
    @Request() req: any,
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string,
  ) {
    const tenantId = tenantIdHeader?.trim() || 'default';
    const requester = req.user.userId;
    // Si no es admin, sólo puede ver su propio perfil
    if (!req.user.roles.includes('admin') && requester !== id) {
      throw new ForbiddenException('No puedes ver este usuario.');
    }
    return await this.usersService.findOne(tenantId, id);
  }

  /**
   * Actualizar usuario:
   * 'admin' puede actualizar a cualquiera; 
   * usuario normal sólo puede actualizar su propio perfil.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  async update(
    @Request() req: any,
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const tenantId = tenantIdHeader?.trim() || 'default';
    const requester = req.user.userId;
    if (!req.user.roles.includes('admin') && requester !== id) {
      throw new ForbiddenException('No puedes actualizar este usuario.');
    }
    return await this.usersService.update(tenantId, id, updateUserDto);
  }

  /**
   * Eliminar usuario físico:
   * Sólo 'admin'.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string,
  ) {
    const tenantId = tenantIdHeader?.trim() || 'default';
    await this.usersService.remove(tenantId, id);
  }

  /**
   * Ver roles de un usuario:
   * Sólo 'admin' o el propio usuario.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get(':id/roles')
  async getUserRoles(
    @Request() req: any,
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string,
  ) {
    const tenantId = tenantIdHeader?.trim() || 'default';
    return await this.usersService.getRoles(tenantId, id);
  }
}
