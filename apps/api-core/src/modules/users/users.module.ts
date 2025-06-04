// apps/api-core/src/modules/users/users.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schemas/user.schema';
import { MailerModule } from '../../common/mailer/mailer.module';

@Module({
  imports: [
    // 1) Registramos el esquema de Usuario para Mongoose
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),

    // 2) MailerModule: expone MailerService, que UsersService usa para enviar correos
    MailerModule,

    // 3) JwtModule: configurado de forma asíncrona para poder inyectar JwtService
    JwtModule.registerAsync({
      imports: [ConfigModule], // importamos ConfigModule para poder usar ConfigService
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET no está definido en variables de entorno');
        }
        return {
          secret,
          signOptions: {
            // Este token se usa, por ejemplo, para verificación de cuenta o recuperación de contraseña.
            expiresIn: configService.get<string>('EMAIL_TOKEN_EXPIRES_IN') || '24h',
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // para que AuthModule o quien lo necesite pueda usar UsersService
})
export class UsersModule {}
