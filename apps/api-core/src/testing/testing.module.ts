// src/testing/testing.module.ts
import { Module } from '@nestjs/common';

import { TestNoOpController } from './controllers/test-noop.controller';
import { TestPlanAccessController } from './controllers/test-plan-access.controller';
import { DemoController } from './controllers/demo.controller';
import { PipelineTestRunnerService } from './services/pipeline-test-runner.service';
import { RuntimePipelineModule } from '../pipeline/runtime-pipeline.module';
import { PipelineFactoryModule } from '../pipeline/factory/pipeline-factory.module';

@Module({
  imports: [
    // IMPORTAMOS los dos módulos de pipeline para que TestingModule pueda resolver:
    RuntimePipelineModule,
    PipelineFactoryModule,
  ],
  controllers: [
    TestNoOpController,
    TestPlanAccessController,
    DemoController,
  ],
  providers: [
    PipelineTestRunnerService,
  ],
  exports: [
    PipelineTestRunnerService,
  ],
})
export class TestingModule {}
