// apps/api-core/src/modules/plans/dto/create-plan.dto.ts

import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  IsOptional,
  IsArray,
  ArrayUnique,
} from 'class-validator';

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  readonly name!: string;

  @IsNumber()
  @Min(0)
  readonly price!: number;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  readonly features?: string[]; // Características opcionales

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  readonly defaultRoles?: string[]; // IDs de Role que vienen por defecto en este plan
}
