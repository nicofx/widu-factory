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
  ParseIntPipe,
  Query
} from '@nestjs/common';
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}
  
  /**
  * Crear un plan en este tenant.
  */
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
  * Listar todos los planes en este tenant.
  */
  @Get()
  async findAll(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Query('search') search?: string,
    @Query('page', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) page = 1,
    @Query('limit', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) limit = 10,
  ) {
    const tenantId = tenantIdHeader?.trim() || 'default';
    return await this.plansService.findAll(tenantId, search, page, limit);
  }
  
  /**
  * Obtener un plan por ID (en este tenant).
  */
  @Get(':id')
  async findOne(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string,
  ) {
    const tenantId = tenantIdHeader?.trim() || 'default';
    return await this.plansService.findOne(tenantId, id);
  }
  
  /**
  * Actualizar un plan (precio, features, roles por defecto).
  */
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
  * Eliminar un plan (hard delete).
  */
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
