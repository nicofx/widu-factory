// src/crud-magic/decorators/filter.decorator.ts
import { SetMetadata } from '@nestjs/common';
export const Filterable = (...fields: string[]) => SetMetadata('filterable', fields);
