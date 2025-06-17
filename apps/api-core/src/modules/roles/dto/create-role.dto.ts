// apps/api-core/src/modules/roles/dto/create-role.dto.ts

import {
  IsNotEmpty,
  IsString,
  IsArray,
  ArrayUnique,
  ArrayNotEmpty,
} from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  readonly name!: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  readonly permissions!: string[]; // IDs de permiso (como strings)
}
