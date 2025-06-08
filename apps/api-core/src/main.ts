// apps/api-core/src/main.ts

import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { TenantMiddleware } from './common/middlewares/tenant.middleware';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';
import { SeederService } from './common/seeder/seeder.service';
import { ValidationPipe } from '@nestjs/common';
import { writeFileSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  
  // Ejecutar seed antes de arrancar listeners
  const seeder = app.get(SeederService);
  try {
    await seeder.seed();
  } catch (err) {
    // Si falla el seed, lo registramos pero seguimos con arranque
    console.error('Error durante seed inicial:', err);
  }
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,         // Remueve props no incluidas en el DTO
      forbidNonWhitelisted: true, // Falla si recibe props fuera del DTO
      transform: true,         // Transforma payloads a la clase DTO
      transformOptions: { enableImplicitConversion: true }, // Para convertir types básicos
    }),
  );
  
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
  writeFileSync('docs/openapi.json', JSON.stringify(document, null, 2));
  
  app.useGlobalFilters(new GlobalHttpExceptionFilter());  // 👈
  
  await app.listen(3000);
  
  console.log('🚀 API corriendo en http://0.0.0.0:3000');
}

bootstrap();
