import { PipelineEngineService } from '../pipeline/pipeline-engine.service';
import { RequestContext } from '../pipeline/interfaces/context.interface';
import { ApiTags, ApiBody, ApiHeader } from '@nestjs/swagger';
import { PipelineException } from '../pipeline/exceptions/pipeline.exception';
import { Body, Controller, Headers, Post, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('example')
@ApiTags('Example')
export class ExampleController {
  constructor(private readonly pipelineEngine: PipelineEngineService) {}

  @ApiHeader({
    name: 'x-tenant',
    description: 'Identificador de tenant para configuración dinámica',
    required: false,
  })
  @Post()
  async handle(
    @Body() body: any,
    @Headers() headers: Record<string, any>,
    @Res() res: Response
  ): Promise<Response> {
    const context: RequestContext = {
      requestId: `REQ-${Date.now()}`,
      body,
      headers,
      meta: { logs: [] },
    };
    
    try {
      await this.pipelineEngine.execute(context);
      return res.status(200).json({
        success: true,
        message: 'Pipeline ejecutado correctamente.',
        data: context.meta.validatedBody ?? {},
        logs: context.meta.logs,
      });
    } catch (err) {
      console.error(`[Pipeline Error]`, err);
      
      if (err instanceof PipelineException) {
        return res.status(err.statusCode).json({
          success: false,
          code: err.code,
          message: err.message,
          details: err.details,
          logs: context.meta.logs,
        });
      }
      
      return res.status(500).json({
        success: false,
        code: 'UNEXPECTED_ERROR',
        message: 'Ha ocurrido un error inesperado.',
        logs: context.meta.logs,
      });
    }
  }
}
import { Module } from '@nestjs/common';
import { ExampleController } from './example/example.controller';
import { RequestPipelineProvider } from './pipeline/request-pipeline.provider';
import { PipelineEngineService } from './pipeline/pipeline-engine.service';
import { AuditTrailSubsystem } from './pipeline/subsystems/audit/audit-trail.subsystem';
import { ErrorManagerSubsystem } from './pipeline/subsystems/error-manager/error-manager.subsystem';
import { StepFilterSubsystem } from './pipeline/subsystems/filter/step-filter.subsystem';
import { ConfigurationSubsystem } from './pipeline/subsystems/configuration/configuration.subsystem';
import { ExecutionControllerSubsystem } from './pipeline/subsystems/execution/execution-controller.subsystem';

@Module({
  controllers: [ExampleController],
  providers: [
    PipelineEngineService,
    RequestPipelineProvider,
    AuditTrailSubsystem,
    ErrorManagerSubsystem,
    StepFilterSubsystem,
    ConfigurationSubsystem,
    ExecutionControllerSubsystem
  ],
})
export class AppModule {}
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const config = new DocumentBuilder()
    .setTitle('WiduFactory API')
    .setDescription('Documentación de endpoints')
    .setVersion('1.0')
    .addServer('http://192.168.56.139:3000')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-tenant',
        in: 'header',
        description: 'Tenant ID (ej: tenant-dev)',
      },
      'x-tenant' // clave interna de referencia
    )
    .build();
  console.log('✅ Nest creado, escuchando...');
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document); // 👈 Acá definís el path /docs
  
  await app.listen(3000, '192.168.56.139');
  console.log('🚀 API corriendo en http://192.168.56.139:3000');
  
}

bootstrap();

import { PipelineStep, PipelinePhase, StepConfig } from '../interfaces/pipeline-step.interface';
import { RequestContext } from '../interfaces/context.interface';

export class BusinessAuditStep implements PipelineStep {
  name = 'BusinessAuditStep';
  phase = PipelinePhase.PROCESSING;
  config: StepConfig = {
    onError: 'continue'
  };

  async execute(context: RequestContext): Promise<void> {
    console.log(`[BusinessAuditStep] Incoming request:`, context.body);
  }
}
import { PipelineStep, PipelinePhase, StepConfig } from '../interfaces/pipeline-step.interface';
import { RequestContext } from '../interfaces/context.interface';

export class MetadataTaggerStep implements PipelineStep {
  name = 'MetadataTaggerStep';
  phase = PipelinePhase.POST;
  config: StepConfig = {
    onError: 'continue'
  };

  async execute(context: RequestContext): Promise<void> {
    console.log(`[MetadataTaggerStep] Incoming request:`, context.body);
  }
}
import { PipelineStep, PipelinePhase, StepConfig } from '../interfaces/pipeline-step.interface';
import { RequestContext } from '../interfaces/context.interface';

export class AuditTrailStep implements PipelineStep {
  name = 'AuditTrailStep';
  phase = PipelinePhase.POST;
  config: StepConfig = {
    onError: 'continue'
  };

  async execute(context: RequestContext): Promise<void> {
    console.log(`[AuditTrailStep] Incoming request:`, context.body);
  }
}
import { PipelineStep, PipelinePhase, StepConfig } from '../interfaces/pipeline-step.interface';
import { RequestContext } from '../interfaces/context.interface';

export class TracerStep implements PipelineStep {
  name = 'TracerStep';
  phase = PipelinePhase.POST;
  config: StepConfig = {
    onError: 'continue'
  };

  async execute(context: RequestContext): Promise<void> {
    console.log(`[TracerStep] Incoming request:`, context.body);
  }
}
import { PipelineStep, PipelinePhase, StepConfig } from '../interfaces/pipeline-step.interface';
import { RequestContext } from '../interfaces/context.interface';

export class SemanticProfilerStep implements PipelineStep {
  name = 'SemanticProfilerStep';
  phase = PipelinePhase.PROCESSING;
  config: StepConfig = {
    onError: 'continue'
  };

  async execute(context: RequestContext): Promise<void> {
    console.log(`[SemanticProfilerStep] Incoming request:`, context.body);
  }
}
// PRE
export * from './logging-step';
export * from './headerCheck-step';
export * from './rateLimiter-step';
export * from './tokenParser-step';
export * from './rawLogger-step';
// PROCESSING
export * from './validation-step';
export * from './normalizer-step';
export * from './semanticProfiler-step';
export * from './contextBuilder-step';
export * from './businessAudit-step';
// POST
export * from './responseFormatter-step';
export * from './metadataTagger-step';
export * from './notifier-step';
export * from './auditTrail-step';
export * from './tracer-step';
import { PipelineStep, PipelinePhase, StepConfig } from '../interfaces/pipeline-step.interface';
import { RequestContext } from '../interfaces/context.interface';

export class NotifierStep implements PipelineStep {
  name = 'NotifierStep';
  phase = PipelinePhase.POST;
  config: StepConfig = {
    onError: 'continue'
  };

  async execute(context: RequestContext): Promise<void> {
    console.log(`[NotifierStep] Incoming request:`, context.body);
  }
}
import { PipelineStep, PipelinePhase, StepConfig } from '../interfaces/pipeline-step.interface';
import { RequestContext } from '../interfaces/context.interface';

export class NormalizerStep implements PipelineStep {
  name = 'NormalizerStep';
  phase = PipelinePhase.PROCESSING;
  config: StepConfig = {
    onError: 'continue'
  };

  async execute(context: RequestContext): Promise<void> {
    console.log(`[NormalizerStep] Incoming request:`, context.body);
  }
}
import { PipelineStep, PipelinePhase } from '../interfaces/pipeline-step.interface';
import { RequestContext } from '../interfaces/context.interface';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ExampleRequestDto } from './dto/example-request.dto';
import { ValidationException } from '../exceptions/validation.exception';

export class ValidationStep implements PipelineStep {
  name = 'ValidationStep';
  phase = PipelinePhase.PROCESSING;
  config = { onError: 'stop' as const };

  async execute(context: RequestContext): Promise<void> {
    console.log(`[ValidationStep] Incoming request:`, context.body);

    const dto = plainToInstance(ExampleRequestDto, context.body);
    const errors = await validate(dto);

  if (errors.length > 0) {
    const formatted = errors.map((err) => ({
      property: err.property,
      constraints: err.constraints,
    }));
    throw new ValidationException(formatted);
  }

    // Si querés, también podés guardar el DTO validado en el contexto
    context.meta.validatedBody = dto;
  }
}
import { PipelineStep, PipelinePhase, StepConfig } from '../interfaces/pipeline-step.interface';
import { RequestContext } from '../interfaces/context.interface';

export class ContextBuilderStep implements PipelineStep {
  name = 'ContextBuilderStep';
  phase = PipelinePhase.PROCESSING;
  config: StepConfig = {
    onError: 'continue'
  };

  async execute(context: RequestContext): Promise<void> {
    console.log(`[ContextBuilderStep] Incoming request:`, context.body);
  }
}
import { PipelineStep, PipelinePhase, StepConfig } from '../interfaces/pipeline-step.interface';
import { RequestContext } from '../interfaces/context.interface';

export class HeaderCheckStep implements PipelineStep {
  name = 'HeaderCheckStep';
  phase = PipelinePhase.PRE;
  config: StepConfig = {
    onError: 'continue'
  };

  async execute(context: RequestContext): Promise<void> {
    console.log(`[HeaderCheckStep] Incoming request:`, context.body);
  }
}
import { PipelineStep, PipelinePhase } from '../interfaces/pipeline-step.interface';
import { RequestContext } from '../interfaces/context.interface';

export class ResponseFormatterStep implements PipelineStep {
  name = 'ResponseFormatterStep';
  phase = PipelinePhase.POST;
  config = { onError: 'continue' as const };

  async execute(context: RequestContext): Promise<void> {
    console.log(`[ResponseFormatterStep] Incoming request:`, context.body);

    const duration = Date.now() - Number(context.requestId.replace('REQ-', ''));

    context.response = {
      success: true,
      requestId: context.requestId,
      timestamp: new Date().toISOString(),
      durationMs: duration,
      result: context.meta.validatedBody ?? {},
      logs: context.meta.logs,
    };
  }
}
import { PipelineStep, PipelinePhase, StepConfig } from '../interfaces/pipeline-step.interface';
import { RequestContext } from '../interfaces/context.interface';

export class RateLimiterStep implements PipelineStep {
  name = 'RateLimiterStep';
  phase = PipelinePhase.PRE;
  config: StepConfig = {
    onError: 'continue'
  };

  async execute(context: RequestContext): Promise<void> {
    console.log(`[RateLimiterStep] Incoming request:`, context.body);
  }
}
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class ExampleRequestDto {
  @IsString()
  @IsNotEmpty()
  @Length(5, 100)
  mensaje!: string;
}
import { PipelineStep, PipelinePhase, StepConfig } from '../interfaces/pipeline-step.interface';
import { RequestContext } from '../interfaces/context.interface';

export class TokenParserStep implements PipelineStep {
  name = 'TokenParserStep';
  phase = PipelinePhase.PRE;
  config: StepConfig = {
    onError: 'continue'
  };

  async execute(context: RequestContext): Promise<void> {
    console.log(`[TokenParserStep] Incoming request:`, context.body);
  }
}
import { PipelineStep, PipelinePhase, StepConfig } from '../interfaces/pipeline-step.interface';
import { RequestContext } from '../interfaces/context.interface';

export class RawLoggerStep implements PipelineStep {
  name = 'RawLoggerStep';
  phase = PipelinePhase.PRE;
  config: StepConfig = {
    onError: 'continue'
  };

  async execute(context: RequestContext): Promise<void> {
    console.log(`[RawLoggerStep] Incoming request:`, context.body);
  }
}
import { PipelineStep, PipelinePhase, StepConfig } from '../interfaces/pipeline-step.interface';
import { RequestContext } from '../interfaces/context.interface';

export class LoggingStep implements PipelineStep {
  name = 'LoggingStep';
  phase = PipelinePhase.PRE;
  config: StepConfig = {
    onError: 'continue'
  };

  async execute(context: RequestContext): Promise<void> {
    console.log(`[LoggingStep] Incoming request:`, context.body);
  }
}
export interface AuditAdapter {
  record(data: AuditEntry): Promise<void>;
}

export interface AuditEntry {
  event: string;
  payload: any;
  timestamp: number;
}
import { Injectable } from '@nestjs/common';
import { AuditAdapter, AuditEntry } from './audit-adapter.interface';
import { ConsoleAuditAdapter } from './console.adapter';

@Injectable()
export class AuditTrailSubsystem {
  private adapters: AuditAdapter[] = [new ConsoleAuditAdapter()];

  async logEvent(event: string, payload: any) {
    const entry: AuditEntry = {
      event,
      payload,
      timestamp: Date.now(),
    };

    for (const adapter of this.adapters) {
      await adapter.record(entry);
    }
  }

  addAdapter(adapter: AuditAdapter) {
    this.adapters.push(adapter);
  }
}
import { AuditAdapter, AuditEntry } from './audit-adapter.interface';

export class ConsoleAuditAdapter implements AuditAdapter {
  async record(data: AuditEntry): Promise<void> {
    console.log(`[AUDIT] ${data.event}`, JSON.stringify(data.payload), `@ ${new Date(data.timestamp).toISOString()}`);
  }
}
import { Injectable } from '@nestjs/common';
import { RequestContext } from '../../interfaces/context.interface';

@Injectable()
export class ErrorManagerSubsystem {
  async handle(error: any, context: RequestContext, stepName: string) {
    context.errors ??= [];
    context.errors.push({
      step: stepName,
      message: error.message || 'Unknown error',
      timestamp: Date.now(),
    });

    console.error(`[ERROR][${stepName}]`, error);
  }
}
import { Injectable } from '@nestjs/common';
import { PipelinePhase } from '../../interfaces/pipeline-step.interface';
import { ConfigurationSubsystem } from '../configuration/configuration.subsystem';

@Injectable()
export class ExecutionControllerSubsystem {
  constructor(private readonly config: ConfigurationSubsystem) {}
  
  public isPhaseEnabled(phase: PipelinePhase, headers: Record<string, any>): boolean {
    // console.log(`[ExecutionController] Headers:`, headers);
    const cfg = this.config.getConfigFromHeaders(headers);
    // console.log(`[ExecutionController] Config loaded:`, cfg);
    if (cfg.disabledPhases && Array.isArray(cfg.disabledPhases)) {
      return !cfg.disabledPhases.includes(phase);
    }
    return true;
  }
  
  public isStepEnabled(stepName: string, headers: Record<string, any>): boolean {
    const cfg = this.config.getConfigFromHeaders(headers);
    if (cfg.disabledSteps && Array.isArray(cfg.disabledSteps)) {
      return !cfg.disabledSteps.includes(stepName);
    }
    return true;
  }
}
import { Injectable } from '@nestjs/common';
import { PipelinePhase, PipelineStep } from '../../interfaces/pipeline-step.interface';
import { RequestContext } from '../../interfaces/context.interface';
import { ExecutionControllerSubsystem } from '../execution/execution-controller.subsystem';

@Injectable()
export class StepFilterSubsystem {
  constructor(private readonly executionController: ExecutionControllerSubsystem) {}

  public filter(
    phase: PipelinePhase,
    steps: PipelineStep[],
    context: RequestContext
  ): PipelineStep[] {
    // 🔍 Fase habilitada?
    const faseHabilitada = this.executionController.isPhaseEnabled(phase, context.headers);

    if (!faseHabilitada) {
      console.log(`[StepFilter] Fase '${phase}' deshabilitada por configuración.`);
      return [];
    }

    // 🔍 Filtrar steps
    const filtered = steps.filter((step) => {
      const habilitado = this.executionController.isStepEnabled(step.name, context.headers);
      if (!habilitado) {
        console.log(`[StepFilter] Step '${step.name}' deshabilitado para fase '${phase}'`);
      }
      return habilitado;
    });

    const stepNames = filtered.map(s => s.name);
    console.log(`[StepFilter] Enabled steps for phase '${phase}':`, stepNames);

    return filtered;
  }
}
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ConfigurationSubsystem {
  private globalConfig: any;

  constructor() {
    this.globalConfig = this.loadConfig('default');
  }

  private loadConfig(name: string): any {
    const filePath = path.resolve(__dirname, '../../../config/', `${name}.json`);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    return {};
  }

  public getConfigFromHeaders(headers: Record<string, any>): any {
    const normalized = Object.fromEntries(
      Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v])
    );

    const tenant = normalized['x-tenant'] || 'default';
    const overrideConfig = this.loadConfig(tenant);

    console.log(`[ConfigurationSubsystem] Usando configuración para tenant: ${tenant}`);

    return { ...this.globalConfig, ...overrideConfig };
  }

  public getValue(key: string, fallback: any = null): any {
    return this.globalConfig[key] ?? fallback;
  }

  public overrideWithHeaders(headers: Record<string, any>): void {
    const tenant = headers['x-tenant'] || 'default';
    const tenantConfig = this.loadConfig(tenant);
    this.globalConfig = { ...this.globalConfig, ...tenantConfig };
  }
}
import { Provider } from '@nestjs/common';
import { PipelinePhase, PipelineStep } from './interfaces/pipeline-step.interface';
import { pipelineConfig } from './pipeline.config';
import * as Steps from './steps';

export const RequestPipelineProvider: Provider<Record<PipelinePhase, PipelineStep[]>> = {
  provide: 'REQUEST_PIPELINE',
  useFactory: () => {
    const registeredSteps = Object.values(Steps).filter(
      (step: any) => typeof step === 'function' && step.prototype?.execute
    );

    const phases: Record<PipelinePhase, PipelineStep[]> = {
      [PipelinePhase.PRE]: [],
      [PipelinePhase.PROCESSING]: [],
      [PipelinePhase.POST]: [],
    };

    for (const step of registeredSteps) {
      const instance: PipelineStep = new step();
      if (pipelineConfig.phases[instance.phase]?.includes(instance.name)) {
        phases[instance.phase].push(instance);
      }
    }

    return phases;
  },
};
import { PipelineException } from './pipeline.exception';

export class ValidationException extends PipelineException {
  constructor(details: any) {
    super('La validación de entrada falló.', 400, 'VALIDATION_ERROR', details);
  }
}
export class PipelineException extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 400,
    public readonly code?: string,
    public readonly details?: any
  ) {
    super(message);
  }
}
import { PipelinePhase } from './interfaces/pipeline-step.interface';

export const pipelineConfig = {
  phases: {
    [PipelinePhase.PRE]: ['LoggingStep', 'HeaderCheckStep', 'TokenParserStep'],
    [PipelinePhase.PROCESSING]: ['ValidationStep'],
    [PipelinePhase.POST]: ['ResponseFormatterStep'],
  },
  rules: {
    disableIfAnonymous: ['UserProfilerStep'],
    alwaysRun: ['LoggingStep'],
    runOnlyIfHeader: {
      'x-run-metadata': ['MetadataTaggerStep'],
    },
  },
};
import { Injectable, Inject } from '@nestjs/common';
import { PipelinePhase, PipelineStep } from './interfaces/pipeline-step.interface';
import { RequestContext } from './interfaces/context.interface';
import { AuditTrailSubsystem } from './subsystems/audit/audit-trail.subsystem';
import { ErrorManagerSubsystem } from './subsystems/error-manager/error-manager.subsystem';
import { StepFilterSubsystem } from './subsystems/filter/step-filter.subsystem';

@Injectable()
export class PipelineEngineService {
  constructor(
    @Inject('REQUEST_PIPELINE')
    private readonly stepsByPhase: Record<PipelinePhase, PipelineStep[]>,
    private readonly audit: AuditTrailSubsystem,
    private readonly errorManager: ErrorManagerSubsystem,
    private readonly filter: StepFilterSubsystem
  ) {}
  
  async execute(context: RequestContext): Promise<void> {
    for (const phase of Object.values(PipelinePhase)) {
      const phaseSteps = this.filter.filter(phase, this.stepsByPhase[phase], context);
      
      if (phaseSteps.length === 0) {
        console.log(`[PipelineEngine] Fase '${phase}' no tiene steps habilitados`);
        continue;
      }
      
      for (const step of phaseSteps) {
        const start = Date.now();
        await this.audit.logEvent('StepStarted', { step: step.name, phase });
        
        try {
          await step.execute(context);
          const duration = Date.now() - start;
          
          await this.audit.logEvent('StepSucceeded', {
            step: step.name,
            phase,
            durationMs: duration,
          });
          
          context.meta.logs.push({
            phase,
            step: step.name,
            status: 'success',
            durationMs: duration,
          });
        } catch (err: any) {
          const duration = Date.now() - start;
          
          await this.errorManager.handle(err, context, step.name);
          await this.audit.logEvent('StepFailed', {
            step: step.name,
            phase,
            durationMs: duration,
            error: err.message,
          });
          
          context.meta.logs.push({
            phase,
            step: step.name,
            status: 'error',
            durationMs: duration,
            details: err.message || err,
          });
          
          if (step.config?.onError !== 'continue') {
            throw err;
          }
        }
      }
    }
  }
}
export interface StepExecutionLog {
  phase: string;
  step: string;
  status: 'success' | 'error' | 'skipped';
  durationMs: number;
  details?: any;
}

export interface RequestContext {
  requestId: string;
  body: any;
  headers: Record<string, any>;
  user?: any;
  result?: any;
  errors?: any[];
  response?: any; // ✅ <--- agregamos esto
  meta: {
    logs: StepExecutionLog[];
    [key: string]: any;
  };
}
export enum PipelinePhase {
  PRE = 'pre',
  PROCESSING = 'processing',
  POST = 'post'
}
import { RequestContext } from "./context.interface";

export interface StepConfig {
  async?: boolean;
  parallelizable?: boolean;
  blocking?: boolean;
  critical?: boolean;
  onError?: 'continue' | 'stop' | 'skip' | 'retry';
}

export enum PipelinePhase {
  PRE = 'pre',
  PROCESSING = 'processing',
  POST = 'post',
}

export interface PipelineStep {
  name: string;
  phase: PipelinePhase;
  execute(context: RequestContext): Promise<void>;
  config?: StepConfig;
}
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist"
  },
  "include": ["src/**/*"]
}
{
  "name": "api-core",
  "version": "1.0.0",
  "type": "commonjs",
  "main": "src/main.ts",
  "scripts": {
    "start": "ts-node src/main.ts",
    "build": "tsc -p tsconfig.json"
  },
  "dependencies": {
    "@nestjs/common": "^10.2.7",
    "@nestjs/core": "^10.2.7",
    "@nestjs/swagger": "^11.2.0",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1",
    "swagger-ui-express": "^5.0.1"
  },
  "devDependencies": {
    "@types/node": "^22.15.21",
    "ts-node": "^10.9.2",
    "typescript": "^5.8.3"
  }
}
