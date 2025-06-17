// apps/api-core/src/modules/permissions/dto/create-permission.dto.ts

import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  readonly name!: string;

  @IsOptional()
  @IsString()
  readonly description?: string;
}
