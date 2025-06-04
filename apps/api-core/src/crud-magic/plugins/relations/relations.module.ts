// src/crud-magic/plugins/relations/relations.module.ts
import { Module } from '@nestjs/common';
import { RelationsService } from '../../services/relations.service';

@Module({
  providers: [RelationsService],
  exports: [RelationsService],
})
export class RelationsModule {}
