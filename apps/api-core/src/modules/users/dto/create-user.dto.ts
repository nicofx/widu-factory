// apps/api-core/src/modules/users/dto/create-user.dto.ts

import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  readonly email!: string;
  
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  readonly password!: string;
  
  @IsOptional()
  @IsString()
  readonly name?: string;
  
  @IsOptional()
  @IsString()
  readonly phone?: string;
  
  @IsOptional()
  @IsString()
  readonly avatarUrl?: string;
  
  roles?: string[]; // Add this line to fix the error
  plan?: string;
  metadata?: {
    name?: string;
    phone?: string;
    avatarUrl?: string;
  };
}
