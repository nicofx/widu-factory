// apps/api-core/src/app.module.ts
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';

/* ─── Módulos de negocio ─── */
import { UsersModule } from './modules/users/users.module';

/* ─── Middleware global ─── */
import { TenantMiddleware } from './common/middlewares/tenant.middleware';

/* ─── Pipeline (layout nuevo) ─── */
import { PipelineCoreModule } from './pipeline/core/pipeline-core.module';
import { PipelineExtensionsModule } from './pipeline/extensions/pipeline-extensions.module';
import { PipelineFactoryModule } from './pipeline/factory/pipeline-factory.module';
import { PipelineInterceptor } from './pipeline/interceptors/pipeline.interceptor';

/* ─── Módulo de pruebas / demos ─── */
import { TestingModule } from './testing/testing.module';

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

    /* Módulos de negocio */
    PassportModule,
    UsersModule,

    /* ─── Pipeline reorganizado ─── */
    PipelineCoreModule,        // motor + subsistemas
    PipelineExtensionsModule,  // pasos & hooks + STEP_REGISTRY
    PipelineFactoryModule,     // token 'PIPELINE_FACTORY'

    /* Módulo de pruebas */
    TestingModule,
  ],
  providers: [
    TenantMiddleware,
    {
      provide: APP_INTERCEPTOR,
      useClass: PipelineInterceptor,
    },
  ],
})
export class AppModule {}
