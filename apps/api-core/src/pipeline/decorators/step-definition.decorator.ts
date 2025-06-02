// src/pipeline/decorators/step-definition.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { PipelinePhase } from '../interfaces/pipeline-step.interface';

export interface StepMetadata {
  name: string;
  phase: PipelinePhase;
  injects?: string[]; // nombres de subsistemas que el step necesita
}

export const STEP_METADATA_KEY = 'STEP_METADATA';

export function StepDefinition(meta: StepMetadata): ClassDecorator {
  return SetMetadata(STEP_METADATA_KEY, meta);
}

export function getStepMetadata(target: any): StepMetadata | undefined {
  return Reflect.getMetadata(STEP_METADATA_KEY, target);
}
