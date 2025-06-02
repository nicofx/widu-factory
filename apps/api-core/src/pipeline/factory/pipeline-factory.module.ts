import { Module, forwardRef } from '@nestjs/common';

/* ─── Motor + subsistemas ─── */
import { PipelineCoreModule } from '../core/pipeline-core.module';

/* ─── Nueva fábrica basada en JSON ─── */
import { FrameworkPipelineFactory } from '../core/factory/framework-pipeline.factory';

@Module({
  imports: [
    /* Asegura que los subsistemas que la factory inyecta estén disponibles */
    forwardRef(() => PipelineCoreModule),
  ],
  providers: [
    {
      provide: 'PIPELINE_FACTORY',
      useClass: FrameworkPipelineFactory,   // 👈 aquí el cambio clave
    },
  ],
  exports: ['PIPELINE_FACTORY'],
})
export class PipelineFactoryModule {}
