// src/testing/controllers/test-plan-access.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { UsePipeline } from '../../pipeline/decorators/pipeline.decorator';

class TestPlanAccessDto {
  planId: string = 'basic';
  feature: string = 'featureA';
}

@Controller('test/plan-access')
@UsePipeline('TestPlanAccessPipeline')
export class TestPlanAccessController {
  @Post()
  test(@Body() body: TestPlanAccessDto) {
    // Si llegamos aquí, significa que el pipeline permitió el acceso
    return { source: body };
  }
}
