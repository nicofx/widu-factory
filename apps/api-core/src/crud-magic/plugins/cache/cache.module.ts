// src/crud-magic/plugins/cache/cache.module.ts
import { Module } from '@nestjs/common';
import { CachePluginService } from '../../services';

@Module({
  providers: [CachePluginService],
  exports: [CachePluginService],
})
export class CachePluginModule {}
