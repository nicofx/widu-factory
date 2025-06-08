// apps/api-core/src/modules/users/dto/update-user.dto.ts

import {
  IsOptional,
  IsString,
  MinLength,
  IsEmail,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  readonly password?: string;

  @IsOptional()
  @IsString()
  readonly name?: string;
}
