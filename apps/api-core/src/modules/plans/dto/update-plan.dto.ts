// apps/api-core/src/modules/plans/dto/update-plan.dto.ts

import {
  IsOptional,
  IsNumber,
  Min,
  IsArray,
  ArrayUnique,
  IsString,
} from 'class-validator';

export class UpdatePlanDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  readonly price?: number;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  readonly features?: string[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  readonly defaultRoles?: string[]; // IDs de Role
}
