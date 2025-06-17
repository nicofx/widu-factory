// src/testing/controllers/test-noop.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { UsePipeline } from '../../pipeline/decorators/pipeline.decorator';

@Controller('test/noop')
export class TestNoOpController {
  @Post()
  @UsePipeline('NoOpPipeline')
  testNoOp(@Body() body: any) {
    return {
      ok: true,
      mensaje: '✅ Ejecutado con NoOpPipeline',
      received: body,
    };
  }
}
