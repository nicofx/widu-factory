// apps/api-core/src/modules/auth/local.strategy.ts

import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',         // el campo que viene en el body para “username”
      passwordField: 'password',      // el campo para la contraseña
      passReqToCallback: true,        // para obtener tenantId del request
    });
  }

  /**
   * Esta función se dispara cuando usamos @UseGuards(AuthGuard('local'))
   * Espera que el body tenga { email, password } y también lee headers.
   * Si validación falla, lanza UnauthorizedException.
   */
  async validate(
    req: Request,
    email: string,
    password: string,
  ): Promise<any> {
    // 1) Extraer tenantId del header. Si no viene, usamos "default"
    const tenantIdRaw = req.headers['x-tenant-id'] as string;
    if (!tenantIdRaw) {
      // Podrías querer lanzar BadRequestException si el tenant es obligatorio
      // Para este ejemplo, asignamos "default" cuando falta
      // throw new BadRequestException('Falta header x-tenant-id');
    }
    const tenantId = tenantIdRaw?.trim() || 'default';

    // 2) Validar credenciales
    const user = await this.authService.validateUser(tenantId, email, password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    // 3) Si todo OK, retornamos user. Passport guard lo expondrá en request.user
    return user;
  }
}
