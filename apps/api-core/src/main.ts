// apps/api-core/src/main.ts

import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { TenantMiddleware } from './common/middlewares/tenant.middleware';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  // Middleware global para tenant
  app.use(new TenantMiddleware().use);

  // Swagger / OpenAPI
  const config = new DocumentBuilder()
    .setTitle('Widu Factory API')
    .setDescription('API Core de Widu Factory (Multi-tenant, HACL, Auth)')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'Authorization',
    )
    .addApiKey(
      { type: 'apiKey', name: 'x-tenant-id', in: 'header', description: 'Tenant ID header' },
      'TenantId',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.useGlobalFilters(new GlobalHttpExceptionFilter());  // 👈

  await app.listen(3000);
  
  console.log('🚀 API corriendo en http://0.0.0.0:3000');
}

bootstrap();
