// apps/api-core/src/testing/testing.module.ts
import { Module } from '@nestjs/common';

/* ── Importa los dos módulos reorganizados ── */
import { PipelineCoreModule } from '../pipeline/core/pipeline-core.module';
import { PipelineExtensionsModule } from '../pipeline/extensions/pipeline-extensions.module';

/* Controllers de prueba existentes */
import { TestNoOpController } from './controllers/test-noop.controller';
import { TestPlanAccessController } from './controllers/test-plan-access.controller';
import { DemoController } from './controllers/demo.controller';

/* (Opcional) servicios de test - si los usas */
import { PipelineTestRunnerService } from './services/pipeline-test-runner.service';
import { PipelineFactoryModule } from '../pipeline/factory/pipeline-factory.module';

@Module({
  imports: [
    /* Motor + pasos */
    PipelineCoreModule,
    PipelineExtensionsModule,
    PipelineFactoryModule,
  ],
  controllers: [
    TestNoOpController,
    TestPlanAccessController,
    DemoController,
  ],
  providers: [
    PipelineTestRunnerService,  // si lo usas
  ],
  exports: [
    PipelineTestRunnerService,
  ],
})
export class TestingModule {}
