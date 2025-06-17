// apps/api-core/src/modules/auth/email-verification.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailVerification, EmailVerificationSchema } from './schemas/email-verification.schema';
import { EmailVerificationService } from './services/email-verification.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmailVerification.name, schema: EmailVerificationSchema }
    ]),
  ],
  providers: [EmailVerificationService],
  exports: [EmailVerificationService],
})
export class EmailVerificationModule {}
