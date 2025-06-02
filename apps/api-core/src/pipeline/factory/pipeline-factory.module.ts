// src/pipeline/factory/pipeline-factory.module.ts
import { Module } from '@nestjs/common';
import { ConfigurablePipelineFactory } from './configurable-pipeline.factory';
import { RuntimePipelineModule } from '../runtime-pipeline.module';

@Module({
  imports: [
    RuntimePipelineModule,
  ],
  providers: [
    {
      provide: 'PIPELINE_FACTORY',
      useClass: ConfigurablePipelineFactory,
    },
  ],
  exports: ['PIPELINE_FACTORY'],
})
export class PipelineFactoryModule {}
