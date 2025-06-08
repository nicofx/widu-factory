
// apps/api-core/src/modules/auth/dto/register.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(64)
  @IsNotEmpty()
  password!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(64)
  @IsNotEmpty()
  name!: string;
}
