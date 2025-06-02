// src/pipeline/extensions/pipeline-extensions.module.ts
import { Module, Global, forwardRef } from '@nestjs/common';
import { PipelineCoreModule } from '../core/pipeline-core.module';

import { STEP_REGISTRY } from './steps/step-registry';

@Global()
@Module({
  imports: [
    // Si algún día un hook quisiera inyectar algo del core
    forwardRef(() => PipelineCoreModule),
  ],
  providers: [
    {
      provide: 'STEP_REGISTRY',
      useValue: STEP_REGISTRY,
    },
  ],
  exports: ['STEP_REGISTRY'],
})
export class PipelineExtensionsModule {}
