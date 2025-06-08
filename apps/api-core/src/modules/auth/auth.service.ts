// apps/api-core/src/modules/auth/auth.service.ts

import { forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

// Inyectamos ConfigService para leer JWT_SECRET y JWT_EXPIRES_IN
import { ConfigService } from '@nestjs/config';

// Usamos scrypt (igual que en UsersService) para verificar la contraseña
import { randomBytes, scrypt as _scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from '../roles/schemas/role.schema';
import { PermissionsService } from '../permissions/permissions.service';
import { RolesService } from '../roles/roles.service';
import { SessionService } from '../sessions/session.service';
import { EmailVerificationService } from './services/email-verification.service';
import { MailerService } from '../../common/mailer/mailer.service';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly sessionService: SessionService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly mailerService: MailerService,
    
  ) {}
  
  /**
  * Validar credenciales de un usuario (tenantId, email, password).
  * @returns El objeto user (sin passwordHash) si es válido, o lanza UnauthorizedException.
  */
  async validateUser(tenantId: string, email: string, password: string): Promise<any> {
    // 1) Buscar usuario por email+tenant
    const user = await this.usersService.findByEmail(tenantId, email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas (usuario/email)');
    }
    // 2) Validar contraseña usando scrypt
    if (!user.passwordHash) {
      throw new UnauthorizedException('Credenciales inválidas (no hay hash)');
    }
    const [salt, storedHashHex] = user.passwordHash.split(':');
    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
    if (derivedKey.toString('hex') !== storedHashHex) {
      throw new UnauthorizedException('Credenciales inválidas (password)');
    }
    // 3) Validar si el email fue confirmado
    if (!user.emailVerified) {
      throw new UnauthorizedException('Debes confirmar tu correo para iniciar sesión.');
    }
    // 4) Retornar user (sin passwordHash)
    const { passwordHash, ...result } = user.toObject ? user.toObject() : user;
    return result;
  }
  
  /**
  * Genera un JWT válido para este usuario.
  * El payload incluirá:
  *  - sub: userId (string)
  *  - tenantId: tenant actual
  *  - roles: array de roles (IDs o nombres), según prefieras.
  * Modificamos para:
  * - Obtener roles y permissions asociados al usuario
  * - Incluir ambos arrays en el payload
  */
  async login(user: any, req?: any): Promise<{ access_token: string, refresh_token: string }> {
    const ipAddress = req?.ip || 'unknown';
    const userAgent = req?.headers['user-agent'] || '';
    
    // 💡 Pasá jwtService y secret
    const session = await this.sessionService.createSession(
      user._id?.toString() ?? user.id,
      user.tenantId,
      ipAddress,
      userAgent,
    );
    
    const roleIds: string[] = user.roles.map((r: any) => r.toString());
    const permissions: string[] = await this.rolesService.getPermissionsForRoles(user.tenantId, roleIds);
    
    const payload = {
      sub: user._id.toString(),
      tenantId: user.tenantId,
      roles: roleIds,
      permissions: permissions,
      sessionId: session.sessionId,
      email: user.email,
    };
    
    const accessToken = this.jwtService.sign(payload);
    if (!session.lastRefreshToken) {
      // Esto nunca debería pasar, pero por las dudas
      throw new Error('No se pudo generar el refresh token');
    }
    return {
      access_token: accessToken,
      refresh_token: session.lastRefreshToken,
    };
  }
  
  // 🔥 PATCH método refreshTokens
  async refreshTokens(refreshToken: string) {
    const secret = this.configService.get<string>('JWT_SECRET')!;
    /* 🚧 llamamos rotateToken con usersService */
    const { session, newRefreshToken, user } = await this.sessionService.rotateToken(
      refreshToken,
      this.jwtService,
      secret,
      this.usersService,
    );
    
    const permissions = await this.rolesService.getPermissionsForRoles(
      session.tenantId,
      user.roles,
    );
    
    const payload = {
      sub: session.userId,
      tenantId: session.tenantId,
      roles: user.roles,
      permissions,
      sessionId: session.sessionId,
      email: user.email,
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: newRefreshToken,
    };
  }
  
  async logout(tenantId: string, sessionId: string) {
    await this.sessionService.revokeSession(tenantId, sessionId);
  }
  
  async resendVerificationEmail(tenantId: string, email: string) {
    // 1. Buscar usuario
    const user = await this.usersService.findByEmail(tenantId, email);
    if (!user) {
      return { success: true, message: 'Si tu email existe, recibirás un correo.' };
    }
    if (user.emailVerified) {
      return { success: true, message: 'Este usuario ya está verificado.' };
    }
    
    // 2. Generar nuevo token y expiración
    const payload = {
      sub: user._id.toString(),
      tenantId: user.tenantId,
      email: user.email,
    };
    const expiresIn = this.configService.get<string>('EMAIL_TOKEN_EXPIRES_IN') || '24h';
    const verificationToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn,
    });
    
    const expiresMs =
    (typeof expiresIn === 'string' && expiresIn.endsWith('h'))
    ? parseInt(expiresIn) * 60 * 60 * 1000
    : 24 * 60 * 60 * 1000; // fallback 24h
    const expiresAt = new Date(Date.now() + expiresMs);
    
    // 3. Persistir el nuevo token y anular los anteriores
    await this.emailVerificationService.create({
      userId: user._id.toString(),
      tenantId: user.tenantId,
      email: user.email,
      token: verificationToken,
      expiresAt,
    });
    
    // 4. Mandar el email
    await this.mailerService.sendVerificationEmail(
      tenantId,
      user.email,
      user.metadata?.name || user.email,
      verificationToken,
    );
    
    return { success: true, message: 'Si tu email existe, recibirás un correo.' };
  }
}
