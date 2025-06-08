// apps/api-core/src/app.module.ts
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

/* ─── Módulos de negocio ─── */

/* ─── Middleware global ─── */
import { TenantMiddleware } from './common/middlewares/tenant.middleware';

/* ─── Pipeline (layout nuevo) ─── */
import { PipelineCoreModule } from './pipeline/core/pipeline-core.module';
import { PipelineExtensionsModule } from './pipeline/extensions/pipeline-extensions.module';
import { PipelineFactoryModule } from './pipeline/factory/pipeline-factory.module';
import { PipelineInterceptor } from './pipeline/interceptors/pipeline.interceptor';

/* ─── Módulo de pruebas / demos ─── */
import { TestingModule } from './testing/testing.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { PlansModule } from './modules/plans/plans.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { LoggingModule } from './common/logging/logging.module';
import { AuditModule } from './common/audit/audit.module';
import { AuditInterceptor } from './common/audit/audit.interceptor';
import { MailerModule } from './common/mailer/mailer.module';
import { CacheModule } from './common/cache/cache.module';
import { FileModule } from './modules/files/file.module';
import { SessionModule } from './modules/sessions/session.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { SeederModule } from './common/seeder/seeder.module';
import { CrudMagicModule } from './crud-magic';
import { ProjectsModule } from './logic/projects/projects.module';
import { CrudMagicLogger } from './crud-magic/interceptors/crud-logger.interceptor';
// import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    /* Config env global */
    ConfigModule.forRoot({
      envFilePath: '/app/.env',
      isGlobal: true,
    }),
    
    
    /* MongoDB */
    MongooseModule.forRootAsync({
      useFactory: () => ({ uri: process.env.MONGO_URI }),
    }),
    
    /* CrudMagic Module */
    // 🔴 Esto regista FILTERING, HACL, SOFT DELETE, RELATIONS, etc.
    CrudMagicModule.forRoot({
      defaultPageSize: 10,
      maxPageSize:     100,

      cache: {
        enabled:    true,
        ttlSeconds: 300,      // 5 minutos en cache
      },

      rateLimit: {
        enabled:     true,
        windowMs:    60_000,  // 1 minuto
        maxRequests: 100,     // máximo 100 reqs por ventana
      },

      i18n: {
        enabled:       false,           // o true si quieres soportar varios idiomas
        locales:       ['es', 'en'],    // lista de locales permitidos
        defaultLocale: 'es',
      },

      metrics: {
        enabled: true,                  // habilita recolección de métricas
      },

      hooks: {
        beforeCreate: ['auditLog'],     // por ejemplo, ejecuta hook “auditLog” antes de crear
        afterCreate:  ['notifyAdmin'],  // y “notifyAdmin” después de crear
        // …puedes agregar más hooks globales aquí…
      },
    }),
    /* Módulos Base */
    UsersModule,
    RolesModule,
    PermissionsModule,
    PlansModule,
    AuthModule,
    HealthModule,
    LoggingModule,
    AuditModule,
    MailerModule,
    CacheModule,
    FileModule,
    SessionModule,
    TenantsModule,
    SeederModule,
    /* ─── Pipeline reorganizado ─── */
    PipelineCoreModule,        // motor + subsistemas
    PipelineExtensionsModule,  // pasos & hooks + STEP_REGISTRY
    PipelineFactoryModule,     // token 'PIPELINE_FACTORY'
    
    /* Módulo de pruebas */
    TestingModule,
    
    /* Módulos de negocio */
    ProjectsModule,
  ],
  providers: [
    TenantMiddleware,
    {
      provide: APP_INTERCEPTOR,
      useClass: PipelineInterceptor,
    },
    {
      provide: 'APP_INTERCEPTOR',
      useClass: AuditInterceptor,
    },
    {
      provide: 'APP_INTERCEPTOR',
      useClass: CrudMagicLogger,
    },
  ],
})
export class AppModule {}
