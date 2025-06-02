// src/pipeline/steps/step-registry.ts

import { PipelineStepConstructor } from '../interfaces/pipeline-step.interface';

// Importa aquí todas las clases de Steps que quieres exponer en la fábrica:
import { LoggingStep } from './logging-step';
import { NoOpStep } from './noop-step';
import { ResponseFormatterStep } from './response-formatter-step';

import { HeaderCheckStep } from './header-check.step';
import { RateLimiterStep } from './rate-limiter.step';
import { TokenParserStep } from './token-parser.step';
import { ValidationStep } from './validation.step';
import { NormalizerStep } from './normalizer.step';
import { ContextBuilderStep } from './context-builder.step';
import { BusinessAuditStep } from './business-audit.step';
import { MetadataTaggerStep } from './metadata-tagger.step';
import { NotifierStep } from './notifier.step';
import { TracerStep } from './tracer.step';

// Mapea cada name (igual al “name” de @StepDefinition) a su clase:
export const STEP_REGISTRY: Record<string, PipelineStepConstructor> = {
  // Steps “core” que ya existían:
  'LoggingStep': LoggingStep,
  'NoOpStep': NoOpStep,
  'ResponseFormatterStep': ResponseFormatterStep,

  // Steps genéricos Fase 3:
  'HeaderCheckStep': HeaderCheckStep,
  'RateLimiterStep': RateLimiterStep,
  'TokenParserStep': TokenParserStep,
  'ValidationStep': ValidationStep,
  'NormalizerStep': NormalizerStep,
  'ContextBuilderStep': ContextBuilderStep,
  'BusinessAuditStep': BusinessAuditStep,
  'MetadataTaggerStep': MetadataTaggerStep,
  'NotifierStep': NotifierStep,
  'TracerStep': TracerStep,

  // Si luego agregas pasos de Planes/ACL, inclúyelos aquí:
  // 'PlanPermissionsStep': PlanPermissionsStep,
  // 'PlanAccessGuardStep': PlanAccessGuardStep,
};
