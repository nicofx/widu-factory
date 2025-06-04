// apps/api-core/src/modules/sessions/session.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Session, SessionSchema } from './schemas/session.schema';
import { SessionService } from './session.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
    forwardRef(() => AuthModule), // para inyectar en AuthService
  ],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
