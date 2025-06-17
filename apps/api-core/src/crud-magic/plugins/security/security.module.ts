// src/crud-magic/plugins/security/security.module.ts
import { Module } from '@nestjs/common';
import { RateLimitGuard } from '../../guards/rate-limit.guard';

@Module({
  providers: [RateLimitGuard],
  exports: [RateLimitGuard],
})
export class SecurityModule {}
