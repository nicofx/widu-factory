// crud-magic/src/plugins/hacl.plugin.module.ts

import { Module } from '@nestjs/common';
import { HaclService } from '../../services/hacl.service';

/**
 * HaclPluginModule
 *
 * Si en algún momento queremos aislar lógica de HACL en su propio módulo,
 * la envolveríamos aquí y exportaríamos HaclService.
 */
@Module({
  providers: [HaclService],
  exports: [HaclService],
})
export class HaclPluginModule {}
