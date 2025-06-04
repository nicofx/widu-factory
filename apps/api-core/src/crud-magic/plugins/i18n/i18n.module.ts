// src/crud-magic/plugins/i18n/i18n.module.ts
import { Module } from '@nestjs/common';
import { I18nService } from '../../services/i18n.service';

@Module({
  providers: [I18nService],
  exports: [I18nService],
})
export class I18nModule {}
