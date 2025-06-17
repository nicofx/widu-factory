// apps/api-core/src/modules/auth/dto/login.dto.ts

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  readonly email!: string;

  @IsString()
  @IsNotEmpty()
  readonly password!: string;
}
