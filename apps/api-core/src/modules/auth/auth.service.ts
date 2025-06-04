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

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly sessionService: SessionService
  ) {}
  
  /**
  * Validar credenciales de un usuario (tenantId, email, password).
  * @returns El objeto user (sin passwordHash) si es válido, o lanza UnauthorizedException.
  */
  async validateUser(
    tenantId: string,
    email: string,
    password: string,
  ): Promise<any> {
    // 1) Obtener usuario con tenantId+email
    const user = await this.usersService.findByEmail(tenantId, email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas (email).');
    }
    
    // 2) user.passwordHash está guardado como "salt:hashHex"
    if (!user.passwordHash) {
      throw new UnauthorizedException('Credenciales inválidas (password hash no encontrado).');
    }
    const [salt, storedHashHex] = user.passwordHash.split(':');
    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
    const derivedKeyHex = derivedKey.toString('hex');
    
    // 3) Comparamos usando timingSafeEqual para evitar ataques de tiempo
    const storedHashBuf = Buffer.from(storedHashHex, 'hex');
    const derivedBuf = Buffer.from(derivedKeyHex, 'hex');
    
    // Si los buffers tienen distinto largo, directament reject
    if (storedHashBuf.length !== derivedBuf.length) {
      throw new UnauthorizedException('Credenciales inválidas (password).');
    }
    if (!timingSafeEqual(storedHashBuf, derivedBuf)) {
      throw new UnauthorizedException('Credenciales inválidas (password).');
    }
    
    // 4) Si llegamos acá, las credenciales son válidas. Retornamos user sin passwordHash.
    const { passwordHash, ...result } = user.toObject();
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
  async login(user: any, req?: any): Promise<{ access_token: string }> {
    
    // 1) crear sesión en DB
    const ipAddress = req?.ip || 'unknown';
    const userAgent = req?.headers['user-agent'] || '';
    const session = await this.sessionService.createSession(
      user.userId,
      user.tenantId,
      ipAddress,
      userAgent,
    );
    
    // 1) user.roles es array de ObjectId (string)
    const roleIds: string[] = user.roles.map((r: any) => r.toString());
    
    // 2) Obtener permisos únicos para esos roles
    const permissions: string[] = await this.rolesService.getPermissionsForRoles(
      user.tenantId,
      roleIds,
    );
    
    // 3) Payload con sub, tenantId, roles y permisos
    const payload = {
      sub: user._id.toString(),
      tenantId: user.tenantId,
      roles: roleIds,
      permissions: permissions,
      sessionId: session.sessionId,
      email: user.email,
    };
    
    const token = this.jwtService.sign(payload);
    return {
      access_token: token,
    };
  }
}
