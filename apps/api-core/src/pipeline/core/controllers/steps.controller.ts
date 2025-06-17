import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { StepMetadataService } from '../services/step-metadata.service';

@ApiTags('Pipeline')
@Controller('pipeline')
export class StepsController {
  constructor(private readonly svc: StepMetadataService) {}

  @Get('steps')
  @ApiOperation({
    summary: 'Lista todos los Steps registrados y su metadata',
  })
  @ApiResponse({ status: 200, description: 'Listado de Steps' })
  list() {
    return {
      generatedAt: new Date().toISOString(),
      steps: this.svc.list(),
    };
  }
}
