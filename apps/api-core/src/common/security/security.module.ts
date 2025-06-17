/// Archivo: apps/api-core/src/common/security/security.module.ts
import { Module } from '@nestjs/common';
import { PasswordService } from './password.service';

@Module({
  providers: [PasswordService],
  exports: [PasswordService],
})
export class SecurityModule {}
