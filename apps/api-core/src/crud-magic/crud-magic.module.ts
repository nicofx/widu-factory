// crud-magic/src/crud-magic.module.ts

import { Global, DynamicModule, Module, Provider, Controller, Inject } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// ── Importar los módulos que exponen los servicios utilizados por HaclService ──
import { PermissionsModule } from '../modules/permissions/permissions.module';
import { RolesModule } from '../modules/roles/roles.module';
import { CacheModule as AppCacheModule } from '../common/cache/cache.module';

// ── Servicios “core” de CrudMagic ──
import {
  FilteringService,
  SortingService,
  PaginationService,
  SoftDeleteService,
  RelationsService,
  ImportExportService,
  BulkOpsService,
  I18nService,
  MetricsService,
  HooksService,
} from './services';

// ── Guards y servicios específicos ──
import { RateLimitGuard } from './guards/rate-limit.guard';
import { HaclService } from './services/hacl.service';

// ── Clase base para servicios y controladores ──
import { BaseCrudService } from './services/base-crud.service';
import { BaseCrudController } from './controllers/base-crud.controller';

// ── Interfaces ──
import { EntityFeature } from './interfaces/entity-feature.interface';
import { CrudMagicOptions } from './interfaces/crud-magic-options.interface';

/**
 * CrudMagicModule
 *
 * Módulo “global” (por @Global) que:
 *  - En forRoot(): registra opciones globales y proveedores centrales
 *  - En forFeature(): genera dinámicamente servicios + controladores CRUD por entidad
 */
@Global()
@Module({})
export class CrudMagicModule {
  /**
   * forRoot(options)
   *
   * - Registra providers comunes (FilteringService, HaclService, etc.)
   * - IMPORTA explícitamente PermissionsModule, RolesModule y AppCacheModule,
   *   porque HaclService necesita PermissionsService, RolesService y CacheService en su constructor.
   */
  static forRoot(options: CrudMagicOptions): DynamicModule {
    const optionsProvider: Provider = {
      provide: 'CRUD_MAGIC_OPTIONS',
      useValue: options,
    };

    return {
      module: CrudMagicModule,
      imports: [
        // MongooseModule importado “a secas” para permitir esquemas dinámicos en forFeature
        MongooseModule,
        // Estos tres módulos exponen los servicios que HaclService inyecta:
        PermissionsModule,
        RolesModule,
        AppCacheModule,
      ],
      providers: [
        optionsProvider,

        // ── Proveedores “core” del CRUD mágico ──
        FilteringService,
        SortingService,
        PaginationService,
        HaclService,           // inyecta internamente PermissionsService, RolesService, CacheService
        SoftDeleteService,
        RelationsService,
        ImportExportService,
        BulkOpsService,
        I18nService,
        MetricsService,
        HooksService,
        RateLimitGuard,
      ],
      exports: [
        // Exportar todos los servicios para que estén disponibles globalmente en toda la app
        FilteringService,
        SortingService,
        PaginationService,
        HaclService,
        SoftDeleteService,
        RelationsService,
        ImportExportService,
        BulkOpsService,
        I18nService,
        MetricsService,
        HooksService,
        RateLimitGuard,
      ],
    };
  }

  /**
   * forFeature(entities)
   *
   * Por cada EntityFeature que recibimos:
   *  1) Registramos el esquema con MongooseModule.forFeature(...)
   *  2) Creamos un provider “CRUD_SERVICE_<ENTITY>” que instancia BaseCrudService
   *  3) Generamos dinámicamente una clase @Controller("<route>") que extiende BaseCrudController
   *     y usa @Inject("CRUD_SERVICE_<ENTITY>") para inyectar exactamente el servicio correcto.
   */
  static forFeature(entities: EntityFeature[]): DynamicModule {
    console.log(
      '⏩ [CrudMagic] forFeature se llamó con estas entidades:',
      entities.map(e => e.name),
    );

    // 1) Registrar cada esquema en MongooseModule
    const mongooseImports = entities.map(feat =>
      MongooseModule.forFeature([{ name: feat.name, schema: feat.schema }]),
    );

    // 2) Crear proveedores de servicio (uno por entidad)
    const serviceProviders: Provider[] = entities.map(feat => {
      const token = `CRUD_SERVICE_${feat.name.toUpperCase()}`;
      console.log(
        ` • [CrudMagic] Creando proveedor para BaseCrudService de "${feat.name}" → token: ${token}`,
      );

      return {
        provide: token,
        // useFactory recibe todos los servicios que BaseCrudService necesita:
        useFactory: (
          filtering: FilteringService,
          hacl: HaclService,
          softDelete: SoftDeleteService,
          relations: RelationsService,
          importExport: ImportExportService,
          bulkOps: BulkOpsService,
          i18n: I18nService,
          metrics: MetricsService,
          hooks: HooksService,
        ) => {
          return new BaseCrudService(
            feat.name,
            feat,
            filtering,
            hacl,
            softDelete,
            relations,
            importExport,
            bulkOps,
            i18n,
            metrics,
            hooks,
          );
        },
        inject: [
          FilteringService,
          HaclService,
          SoftDeleteService,
          RelationsService,
          ImportExportService,
          BulkOpsService,
          I18nService,
          MetricsService,
          HooksService,
        ],
      };
    });

    // 3) Generar dinámicamente la clase @Controller para cada entidad
    const controllerClasses: any[] = entities.map(feat => {
      const routePath = feat.name.toLowerCase();
      console.log(
        ` • [CrudMagic] Generando clase @Controller("${routePath}") que extiende BaseCrudController`,
      );

      @Controller(routePath)
      class GeneratedCrudController extends BaseCrudController {
        constructor(
          // 1er parámetro: inyectamos explícitamente el token “CRUD_SERVICE_<ENTITY>”
          @Inject(`CRUD_SERVICE_${feat.name.toUpperCase()}`)
          crudService: BaseCrudService,

          // El resto: se inyecta automáticamente por tipo
          filteringService: FilteringService,
          sortingService: SortingService,
          paginationService: PaginationService,
          rateLimitGuard: RateLimitGuard,
        ) {
          // El constructor de BaseCrudController debe esperar estos 5 parámetros en este orden:
          super(feat.name, crudService, filteringService, sortingService, paginationService);
          console.log(
            `  → [CrudMagic] Se instanció GeneratedCrudController para "${feat.name}"`,
          );
        }
      }

      return GeneratedCrudController;
    });

    console.log(
      `⏩ [CrudMagic] Devolver DynamicModule con Controllers:`,
      controllerClasses.map(c => c?.name),
      'y Providers:',
      serviceProviders.map(p => (p as any).provide),
    );

    // 4) Devolvemos el DynamicModule completo:
    return {
      module: CrudMagicModule,
      imports: [...mongooseImports],
      providers: [...serviceProviders],
      controllers: [...controllerClasses],
      // Hacemos export de todos los tokens “CRUD_SERVICE_<ENTITY>” para que estén disponibles si alguien
      // quisiera inyectarlos por separado. (Por ejemplo, si otro módulo quisiera usar ese servicio.)
      exports: serviceProviders.map(p => (p as any).provide as string),
    };
  }
}
