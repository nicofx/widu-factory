// apps/api-core/src/modules/users/dto/update-profile.dto.ts

import { IsOptional, IsString, IsMongoId, IsPhoneNumber } from 'class-validator';

/**
 * Cambios de perfil extendido del usuario.
 * Se extiende fácil, podés poner lo que quieras acá.
 */
export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  readonly bio?: string;

  @IsOptional()
  @IsPhoneNumber('AR', { message: 'El teléfono debe ser válido (incluye código de país).' })
  readonly phone?: string;

  @IsOptional()
  @IsMongoId({ message: 'El avatar debe ser un ID válido de archivo.' })
  readonly avatar?: string; // ID de FileMeta, NO la URL.
}
