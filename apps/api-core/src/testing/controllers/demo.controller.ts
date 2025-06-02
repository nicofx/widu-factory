// apps/api-core/src/testing/controllers/demo.controller.ts
import { Controller, Post, Req, Res } from '@nestjs/common';
import { UsePipeline } from '../../pipeline/decorators/pipeline.decorator';
import { Request, Response } from 'express';

@Controller('testing')
export class DemoController {
  @UsePipeline('default')
  @Post('demo-generico')
  async runDemo(
    @Req() request: Request, 
    @Res() response: Response
  ) {
    return response.json(request.pipelineContext.response);
  }
}
