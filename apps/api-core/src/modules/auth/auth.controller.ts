// apps/api-core/src/modules/auth/auth.controller.ts

import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

// Guard Local para login
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt-auth.guard';
// Guard JWT para proteger rutas

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Endpoint POST /auth/login
   * Body: { email, password }
   * Header: x-tenant-id (opcional)
   * Devuelve: { access_token: string }
   */
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(
    @Request() req: any,           // Aquí Passport ya colocó req.user = user (del LocalStrategy)
    @Headers('x-tenant-id') tenantIdHeader: string,
  ) {
    // req.user contiene { _id, email, tenantId, roles, ... } (sin passwordHash)
    const user = req.user;
    // Confirmamos / ajustamos tenantId al que venga en header o default
    const tenantId = tenantIdHeader?.trim() || 'default';
    if (tenantId !== user.tenantId) {
      // Si el tenant en el token no coincide con el header, rechazamos
      throw new UnauthorizedException('Tenant inválido');
    }
    // Generar JWT
    return this.authService.login(user);
  }

  /**
   * Ejemplo de endpoint protegido con JWT: GET /auth/profile
   * El guard JwtAuthGuard valida el token y inyecta req.user = { userId, tenantId, roles }.
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return {
      msg: 'Aquí va la información del perfil',
      user: req.user,
    };
  }

  
  /**
   * GET /auth/me
   * Devuelve { userId, tenantId, roles, permissions, email }
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req: any) {
    const user = req.user;
    return {
      userId: user.userId,
      tenantId: user.tenantId,
      roles: user.roles,
      permissions: user.permissions,
      email: user.email,
    };
  }
}
