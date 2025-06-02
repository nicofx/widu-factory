// apps/api-core/src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';

import { UsersModule } from './modules/users/users.module';

import { TenantMiddleware } from './common/middlewares/tenant.middleware';

import { PipelineFactoryModule } from './pipeline/factory/pipeline-factory.module';
import { RuntimePipelineModule } from './pipeline/runtime-pipeline.module';
import { PipelineInterceptor } from './pipeline/interceptors/pipeline.interceptor';
import { TestingModule } from './testing/testing.module';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    // — Configuración global de variables de entorno —
    ConfigModule.forRoot({
      envFilePath: '/app/.env',
      isGlobal: true,
    }),

    // — Conexión a MongoDB —
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGO_URI,
      }),
    }),

    // — Módulos “legacy” que ya existían —
    PassportModule,
    UsersModule,

    // — AÑADIMOS aquí los módulos de Pipeline —
    PipelineFactoryModule,
    RuntimePipelineModule,

    // — Resto de módulos que siguen intactos —
    TestingModule,
  ],
  controllers: [
    // (Si tuvieras controladores globales que quisieras declarar, irían aquí)
  ],
  providers: [
    // — Middlewares, estrategias y servicios que ya tenías —
    TenantMiddleware,

    // — Registramos el PipelineInterceptor como provider —
    {
      provide: APP_INTERCEPTOR,
      useClass: PipelineInterceptor,
    },
  ],
  // No exportamos nada del Pipeline desde AppModule, 
  // ya que los módulos de Pipeline se importan directamente arriba.
})
export class AppModule {}
