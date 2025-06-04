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
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

// Guard Local para login
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { MailerService } from '../../common/mailer/mailer.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { randomBytes, scrypt as scryptCallback } from 'crypto';
import { promisify } from 'util';
const scrypt = promisify(scryptCallback);
// Guard JWT para proteger rutas

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailerService: MailerService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Endpoint POST /auth/login
   * Body: { email, password }
   * Header: x-tenant-id (opcional)
   * Devuelve: { access_token: string }
   */
  @UseGuards(AuthGuard('local'))
  @Post('login')
  // @Throttle(5, 60) // máximo 5 intentos de login por IP+user en 60 segundos
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
    return this.authService.login(user, req);
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

    /**
   * POST /auth/forgot-password
   * Recibe { email } y genera token si existe el usuario. Luego envía email.
   */
  @Post('forgot-password')
  async forgotPassword(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() dto: ForgotPasswordDto,
  ) {
    const tenantId = tenantIdHeader?.trim() || 'default';
    // 1) Buscar usuario por email
    const user = await this.usersService.findByEmail(tenantId, dto.email);
    if (!user) {
      // No informar que no existe; para no filtrar emails
      return { success: true, message: 'Si tu email existe, recibirás un correo.' };
    }
    // 2) Generar token JWT corto para reset
    const payload = {
      sub: user._id.toString(),
      tenantId: user.tenantId,
      email: user.email,
    };
    const expiresIn = this.configService.get<string>('RESET_TOKEN_EXPIRES_IN') || '1h';
    const resetToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn,
    });

    // 3) Enviar correo de reset
    await this.mailerService.sendPasswordResetEmail(
      tenantId,
      user.email,
      user.metadata?.name || user.email,
      resetToken,
    );

    return { success: true, message: 'Si tu email existe, recibirás un correo.' };
  }

  /**
   * POST /auth/reset-password
   * Recibe { token, newPassword }.
   */
  @Post('reset-password')
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ) {
    // 1) Verificar token
    let payload: any;
    try {
      payload = this.jwtService.verify(dto.token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch (err) {
      throw new BadRequestException('Token inválido o expirado.');
    }
    const tenantId = payload.tenantId;
    const userId = payload.sub;

    // 2) Actualizar contraseña
    const salt = randomBytes(8).toString('hex');
    const derivedKey = (await scrypt(dto.newPassword, salt, 64)) as Buffer;
    const passwordHash = `${salt}:${derivedKey.toString('hex')}`;

    await this.usersService.updatePassword(tenantId, userId, passwordHash);

    return { success: true, message: 'Contraseña actualizada correctamente.' };
  }
}
