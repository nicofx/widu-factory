import { Injectable } from '@nestjs/common';
import { STEP_REGISTRY } from '../../extensions/steps/step-registry';
import { getStepMetadata } from '../../decorators/step-definition.decorator';

/** Devuelve la metadata declarada en @StepDefinition de cada Step */
@Injectable()
export class StepMetadataService {
  list() {
    return Object.values(STEP_REGISTRY)
      .map((cls: any) => getStepMetadata(cls))
      .filter(Boolean)
      .sort((a, b) => a!.name.localeCompare(b!.name));
  }
}
