// crud-magic/src/crud-magic.module.ts

import { Global, Module, DynamicModule, Provider, Inject, Controller } from '@nestjs/common';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';

import { CrudMagicOptions } from './interfaces/crud-magic-options.interface';

import { PermissionsModule } from '../modules/permissions/permissions.module';
import { RolesModule } from '../modules/roles/roles.module';
import { CacheModule as AppCacheModule } from '../common/cache/cache.module';

// Servicios “core”
import { FilteringService } from './services/filtering.service';
import { SortingService } from './services/sorting.service';
import { PaginationService } from './services/pagination.service';
import { HaclService } from './services/hacl.service';
import { SoftDeleteService } from './services/soft-delete.service';
import { RelationsService } from './services/relations.service';
import { ImportExportService } from './services/import-export.service';
import { BulkOpsService } from './services/bulk-ops.service';
import { I18nService } from './services/i18n.service';
import { MetricsService } from './services/metrics.service';
import { HooksService } from './services/hooks.service';
import { RateLimitGuard } from './guards/rate-limit.guard';

import { BaseCrudService } from './services/base-crud.service';
import { BaseCrudController } from './controllers/base-crud.controller';
import { EntityFeature } from './interfaces/entity-feature.interface';
import { Model } from 'mongoose';
import { CachePluginService } from './services';
import { validateCrudConfig } from './utils/config-validator';
import { CrudPreset, PRESETS } from './constants/presets';

@Global()
@Module({})
export class CrudMagicModule {
  static forRoot(options: CrudMagicOptions): DynamicModule {
    return {
      module: CrudMagicModule,
      imports: [
        PermissionsModule,
        RolesModule,
        AppCacheModule,
      ],
      providers: [
        { provide: 'CRUD_MAGIC_OPTIONS', useValue: options },
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
        CachePluginService,
        RateLimitGuard,
      ],
      exports: [
        'CRUD_MAGIC_OPTIONS',
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
        CachePluginService,
        RateLimitGuard,
      ],
    };
  }
  
  static forFeature(rawFeatures: Array<EntityFeature & { preset?: CrudPreset }>): DynamicModule {
    const features = rawFeatures.map((f) => {
      const base = f.preset ? PRESETS[f.preset] : {};
      return { ...base, ...f } as EntityFeature;
    });
    
    features.forEach(validateCrudConfig);
    const providers: Provider[] = [];
    const controllers = [];
    
    for (const feat of features) {
      // ------------------------------
      // 1) Registrar el esquema Mongoose
      // ------------------------------
      MongooseModule.forFeature([{ name: feat.name, schema: feat.schema }]);
      
      // ------------------------------
      // 2) Provider para “entityName” (valor constante)
      // ------------------------------
      const entityNameProvider: Provider = {
        provide: `ENTITY_NAME_${feat.name.toUpperCase()}`,
        useValue: feat.name,
      };
      
      // ------------------------------
      // 3) Provider para “feature” (EntityFeature)
      // ------------------------------
      const featureProvider: Provider = {
        provide: `FEATURE_${feat.name.toUpperCase()}`,
        useValue: feat,
      };
      
      providers.push(entityNameProvider, featureProvider);
      
      // ------------------------------
      // 4) Provider dinámico para BaseCrudService (solo 12 parámetros)
      // ------------------------------
      const serviceProvider: Provider = {
        provide: `CRUD_SERVICE_${feat.name.toUpperCase()}`,
        useFactory: (
          model: Model<any>,             //  1) Model<Mongoose>
          entityName: string,            //  2) el string con el nombre de la entidad
          feature: EntityFeature,        //  3) la definición EntityFeature
          filtering: FilteringService,   //  4)
          hacl: HaclService,             //  5)
          softDelete: SoftDeleteService, //  6)
          relations: RelationsService,   //  7)
          importExport: ImportExportService, //  8)
          bulkOps: BulkOpsService,       //  9)
          i18n: I18nService,             // 10)
          metrics: MetricsService,       // 11)
          hooks: HooksService,           // 12)
        ) => {
          // ‣ Llamamos EXACTAMENTE a los 12 parámetros que espera el constructor:
          return new BaseCrudService(
            model,         //  1
            entityName,    //  2
            feature,       //  3
            filtering,     //  4
            hacl,          //  5
            softDelete,    //  6
            relations,     //  7
            importExport,  //  8
            bulkOps,       //  9
            i18n,          // 10
            metrics,       // 11
            hooks,         // 12
          );
        },
        inject: [
          getModelToken(feat.name),               //  1)
          `ENTITY_NAME_${feat.name.toUpperCase()}`,//  2)
          `FEATURE_${feat.name.toUpperCase()}`,    //  3)
          FilteringService,                       //  4)
          HaclService,                            //  5)
          SoftDeleteService,                      //  6)
          RelationsService,                       //  7)
          ImportExportService,                    //  8)
          BulkOpsService,                         //  9)
          I18nService,                            // 10)
          MetricsService,                         // 11)
          HooksService,                           // 12)
        ],
      };
      
      providers.push(serviceProvider);
      
      // ------------------------------
      // 5) Controlador dinámico
      // ------------------------------
      @Controller(feat.name.toLowerCase())
      class GeneratedCrudController extends BaseCrudController {
        constructor(
          @Inject(`CRUD_SERVICE_${feat.name.toUpperCase()}`)
          crudService: BaseCrudService,
          filteringService: FilteringService,
          sortingService: SortingService,
          paginationService: PaginationService,
          rateLimitGuard: RateLimitGuard,
        ) {
          super(
            feat.name,
            crudService,
            filteringService,
            sortingService,
            paginationService,
          );
        }
      }
      controllers.push(GeneratedCrudController);
    }
    
    return {
      module: CrudMagicModule,
      imports: [
        AppCacheModule,
        ...features.map((f) =>
          MongooseModule.forFeature([{ name: f.name, schema: f.schema }]),
      ),
    ],
    providers,
    controllers,
    exports: providers.map((p) => (p as any).provide as string),
  };
}
}