// apps/api-core/src/modules/plans/plans.controller.ts

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
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('plans')
@UseGuards(JwtAuthGuard, TenantGuard)
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  /**
   * POST /plans
   * - Sólo usuarios con permiso 'plans.create'.
   */
  @UseGuards(PermissionsGuard)
  @Permissions('plans.create')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() createDto: CreatePlanDto,
  ) {
    const tenantId = tenantIdHeader?.trim() || 'default';
    return await this.plansService.create(tenantId, createDto);
  }

  /**
   * GET /plans?search=&page=&limit=
   * - Sólo usuarios con permiso 'plans.read'.
   */
  @UseGuards(PermissionsGuard)
  @Permissions('plans.read')
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
    return await this.plansService.findAll(tenantId, search, page, limit);
  }

  /**
   * GET /plans/:id
   * - Sólo usuarios con permiso 'plans.read'.
   */
  @UseGuards(PermissionsGuard)
  @Permissions('plans.read')
  @Get(':id')
  async findOne(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string,
  ) {
    const tenantId = tenantIdHeader?.trim() || 'default';
    return await this.plansService.findOne(tenantId, id);
  }

  /**
   * PATCH /plans/:id
   * - Sólo usuarios con permiso 'plans.update'.
   */
  @UseGuards(PermissionsGuard)
  @Permissions('plans.update')
  @Patch(':id')
  async update(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string,
    @Body() updateDto: UpdatePlanDto,
  ) {
    const tenantId = tenantIdHeader?.trim() || 'default';
    return await this.plansService.update(tenantId, id, updateDto);
  }

  /**
   * DELETE /plans/:id
   * - Sólo usuarios con permiso 'plans.delete'.
   */
  @UseGuards(PermissionsGuard)
  @Permissions('plans.delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string,
  ) {
    const tenantId = tenantIdHeader?.trim() || 'default';
    await this.plansService.remove(tenantId, id);
  }
}
