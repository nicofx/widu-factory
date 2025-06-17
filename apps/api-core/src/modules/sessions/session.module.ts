// apps/api-core/src/modules/sessions/session.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Session, SessionSchema } from './schemas/session.schema';
import { SessionService } from './session.service';
import { AuthModule } from '../auth/auth.module';
import { SessionsController } from './sessions.controller';
import { TenantsModule } from '../tenants/tenants.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [SessionsController],
  imports: [
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
    forwardRef(() => AuthModule), // para inyectar en AuthService
    TenantsModule,
    JwtModule,
  ],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}


