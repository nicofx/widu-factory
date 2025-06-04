// apps/api-core/src/common/logging/logger.service.ts

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import 'winston-mongodb';

@Injectable()
export class LoggerService {
  // Este campo es la instancia real de Winston
  public readonly logger: winston.Logger;
  
  constructor(
    private readonly configService: ConfigService,
  ) {
    // Ahora usamos WinstonModule de nest-winston para crear el logger
    const { createLogger, transports, format } = require('winston');
    require('winston-mongodb');
    
    this.logger = createLogger({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      transports: [
        // Consola
        new transports.Console({
          format: format.combine(
            format.timestamp(),
            format.prettyPrint(),
          ),
        }),
        // Archivo
        new transports.File({
          filename: 'logs/app.log',
          level: 'info',
          format: format.combine(
            format.timestamp(),
            format.json(),
          ),
        }),
        // MongoDB: ahora con mongoUrl en lugar de db
        new winston.transports.MongoDB({
          db: this.configService.get<string>('MONGO_URI')!,
          options: { useUnifiedTopology: true },
          collection: 'application_logs',
          level: 'warn',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      ],
      exitOnError: false,
    });
    
  }
  
  info(message: string, meta?: any) {
    this.logger.info(message, meta);
  }
  warn(message: string, meta?: any) {
    this.logger.warn(message, meta);
  }
  error(message: string, trace?: string, meta?: any) {
    this.logger.error(message, { trace, ...meta });
  }
  debug(message: string, meta?: any) {
    this.logger.debug(message, meta);
  }
}
