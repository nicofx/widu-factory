// crud-magic/src/controllers/base-crud.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  UseGuards,
  UseInterceptors,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseCrudService } from '../services/base-crud.service';
import { RateLimitGuard } from '../guards/rate-limit.guard';
import { Crud } from '../decorators/crud.decorator';
import { PaginationOptions } from '../interfaces/pagination.interface';
import { FilteringService, PaginationService, SortingService } from '../services';
import { Hacl, HaclGuard } from '../guards';

/**
 * BaseCrudController
 *
 * Controlador dinámico que expone las rutas automáticas CRUD para una entidad:
 *
 *  GET    /<entidad>          → findAll
 *  GET    /<entidad>/:id      → findOne
 *  POST   /<entidad>          → create
 *  PATCH  /<entidad>/:id      → update
 *  DELETE /<entidad>/:id      → delete
 *
 * Opcionalmente:
 *  POST   /<entidad>/bulk-create   → bulkCreate
 *  PATCH  /<entidad>/bulk-update   → bulkUpdate
 *  GET    /<entidad>/export-csv    → exportCsv
 *  POST   /<entidad>/import-csv    → importCsv
 *
 * Usa:
 *  - RateLimitGuard (plugin interno)
 *  - Métodos de BaseCrudService
 *
 * Sprint X: cada método invocará al servicio, manejará query params y encabezados (tenantId, user).
 */
@Crud() // Decorador para inyectar metadata si es necesario
@Controller() // La ruta base se especifica dinámicamente (ver Factory en CrudMagicModule)
export class BaseCrudController {
  constructor(
  private readonly entityName: string,
  private readonly service: BaseCrudService,
  private readonly filteringService: FilteringService,
  private readonly sortingService: SortingService,
  private readonly paginationService: PaginationService,
  ) {}

  /**
   * GET /<entidad>?page=&limit=&sort=&filters…
   */
  @UseGuards(RateLimitGuard, HaclGuard)
  @Hacl('{entity}.read') // se reemplazará en tiempo de ejecución por el nombre real
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: any,
  ) {
    // 1) Tenant por defecto si falta
    const t = tenantId?.trim() || 'default';
    // 2) Usuario (payload JWT) inyectado por JwtAuthGuard / TokenParserStep
    const user = req.user;
    // 3) Armar filtro a partir del query
    const filterCriteria = this.filteringService.buildFilter(query);
    // 4) Armar ordenamiento
    const sortCriteria = this.sortingService.buildSort(query);
    // 5) Armar paginación
    const { skip, limit, page } = this.paginationService.parse(query);

    // 6) Combinar con regla HACL (si HACL devolviera filtros adicionales),
    //    en caso de que quisieras hacer algo como “solo ver mis propios registros”:
    //    const haclFilter = await this.haclService.getAllowedFilter(t, user, `${this.entityName}.read`);
    //    finalFilter = { ...haclFilter, ...filterCriteria }

    // 7) Ejecutar consulta
    const [data, total] = await this.service.findAll(
      t,
      user,
      filterCriteria,
      sortCriteria,
      skip,
      limit,
    );

    // 8) Envolver respuesta con meta
    return res.json({
      data,
      meta: {
        total,
        page,
        limit,
        elapsedMs: Date.now() - Number((req as any).startTime || Date.now()),
      },
    });
  }
  
  /**
   * GET /<entidad>/:id
   */
  @UseGuards(RateLimitGuard, HaclGuard)
  @Hacl('{entity}.read') // “<entidad>.read”
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    const t = tenantId?.trim() || 'default';
    const user = req.user;

    // 1) (Opcional) Comprobar HACL para “read” en el service
    //    En checkPermission ya lo hizo el guard, así que aquí suponemos OK.

    const item = await this.service.findOne(t, user, id);
    return res.json(item);
  }

  /**
   * POST /<entidad>
   */
  @UseGuards(RateLimitGuard, HaclGuard)
  @Hacl('{entity}.create')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: any,
  ) {
    const t = tenantId?.trim() || 'default';
    const user = req.user;

    // La validación de HACL para “create” ya la hizo el guard.
    const created = await this.service.create(t, user, dto);
    return res.status(HttpStatus.CREATED).json(created);
  }

  /**
   * PATCH /<entidad>/:id
   */
  @UseGuards(RateLimitGuard, HaclGuard)
  @Hacl('{entity}.update')
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    const t = tenantId?.trim() || 'default';
    const user = req.user;

    const updated = await this.service.update(t, user, id, dto);
    return res.json(updated);
  }

  /**
   * DELETE /<entidad>/:id
   */
  @UseGuards(RateLimitGuard, HaclGuard)
  @Hacl('{entity}.delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Req() req: Request,
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    const t = tenantId?.trim() || 'default';
    const user = req.user;

    await this.service.delete(t, user, id);
    return; // 204 No Content
  }

  /**
   * POST /<entidad>/bulk-create
   */
  @UseGuards(RateLimitGuard, HaclGuard)
  @Hacl('{entity}.create')
  @Post('bulk-create')
  @HttpCode(HttpStatus.CREATED)
  async bulkCreate(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('x-tenant-id') tenantId: string,
    @Body() dtos: any[],
  ) {
    const t = tenantId?.trim() || 'default';
    const user = req.user;
    const created = await this.service.bulkCreate(t, user, dtos);
    return res.status(HttpStatus.CREATED).json(created);
  }


  /**
   * PATCH /<entidad>/bulk-update
   */
  @UseGuards(RateLimitGuard, HaclGuard)
  @Hacl('{entity}.update')
  @Patch('bulk-update')
  @HttpCode(HttpStatus.OK)
  async bulkUpdate(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('x-tenant-id') tenantId: string,
    @Body() items: { id: string; dto: any }[],
  ) {
    const t = tenantId?.trim() || 'default';
    const user = req.user;
    const updated = await this.service.bulkUpdate(t, user, items);
    return res.json(updated);
  }

  /**
   * GET /<entidad>/export-csv
   */
  @UseGuards(RateLimitGuard, HaclGuard)
  @Hacl('{entity}.read')
  @Get('export-csv')
  @HttpCode(HttpStatus.OK)
  async exportCsv(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('x-tenant-id') tenantId: string,
    @Query() filter: any,
  ) {
    const t = tenantId?.trim() || 'default';
    const user = req.user;
    const csvBuffer = await this.service.exportCsv(t, user, filter);
    res.setHeader('Content-Type', 'text/csv');
    return res.send(csvBuffer);
  }

  /**
   * POST /<entidad>/import-csv
   */
  @UseGuards(RateLimitGuard, HaclGuard)
  @Hacl('{entity}.create')
  @Post('import-csv')
  @HttpCode(HttpStatus.CREATED)
  async importCsv(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('x-tenant-id') tenantId: string,
    @Body('csvBuffer') csvBuffer: Buffer,
  ) {
    const t = tenantId?.trim() || 'default';
    const user = req.user;
    const result = await this.service.importCsv(t, user, csvBuffer);
    return res.status(HttpStatus.CREATED).json(result);
  }
}
