// src/pipeline/decorators/pipeline.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const USE_PIPELINE_KEY = 'USE_PIPELINE';
export const SKIP_PIPELINE_KEY = 'SKIP_PIPELINE';

/**
 * @UsePipeline('NombrePipeline')
 */
export const UsePipeline = (name: string) =>
  SetMetadata(USE_PIPELINE_KEY, name);

/**
 * @SkipPipeline()
 */
export const SkipPipeline = () =>
  SetMetadata(SKIP_PIPELINE_KEY, true);
