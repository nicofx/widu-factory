// apps/api-core/src/modules/auth/auth.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';

// Importamos los módulos que proporcionan UsersService y RolesService
import { UsersModule } from '../users/users.module';
import { RolesModule } from '../roles/roles.module';
import { SessionModule } from '../sessions/session.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // JwtModule se registra con el secret y expiresIn del ConfigService
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const jwtSecret = configService.get<string>('JWT_SECRET');
        if (!jwtSecret) {
          throw new Error('JWT_SECRET no está definido en variables de entorno');
        }
        return {
          secret: jwtSecret,
          signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '3600s' },
        };
      },
      inject: [ConfigService],
    }),

    // Aseguramos que UsersModule y RolesModule estén disponibles
    forwardRef(() => UsersModule),
    forwardRef(() => RolesModule),
    forwardRef(() => SessionModule), // ← aquí agregamos SessionModule
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtAuthGuard,
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
