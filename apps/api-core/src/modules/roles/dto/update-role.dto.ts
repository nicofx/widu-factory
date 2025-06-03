// apps/api-core/src/modules/roles/dto/update-role.dto.ts

import {
  IsOptional,
  IsString,
  IsArray,
  ArrayUnique,
  ArrayNotEmpty,
} from 'class-validator';

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  readonly name?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  readonly permissions?: string[];
}
