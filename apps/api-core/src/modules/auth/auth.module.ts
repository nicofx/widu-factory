// apps/api-core/src/modules/auth/auth.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

// Strategies
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';

// Guard
import { JwtAuthGuard } from './jwt-auth.guard';

// Para validar usuarios, inyectamos UsersModule
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    // PassportModule para usar estrategias (“local”, “jwt”)
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // JwtModule: aquí registramos el secret y el expiration
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '3600s',
        },
      }),
      inject: [ConfigService],
    }),

    // Para poder buscar el user (por email+tenantId)
    forwardRef(() => UsersModule),
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
