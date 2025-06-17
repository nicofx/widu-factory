// src/crud-magic/plugins/hooks/hooks.module.ts
import { Module, DynamicModule } from '@nestjs/common';

@Module({})
export class HooksModule {
  static register(hooks: any[]): DynamicModule {
    return {
      module: HooksModule,
      providers: [...hooks],
      exports: [...hooks],
    };
  }
}
