// apps/api-core/src/modules/auth/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly configService: ConfigService) {
        const jwtSecret = configService.get<string>('JWT_SECRET');
        if (!jwtSecret) {
            throw new UnauthorizedException('JWT_SECRET no está definido en variables de entorno');
        }
        const options: StrategyOptions = {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtSecret,       // ahora es “string” seguro
            ignoreExpiration: false,
        };
        super(options);
    }
    
    /**
    * Después de verificar la firma, Passport llama a validate() con el payload decodificado.
    * Aquí retornamos un objeto “user” que se inyectará en request.user.
    */
    // 🔥 PATCH validate()
    async validate(payload: any) {
          console.log('JWT payload', payload);
        // payload contiene sub, tenantId, roles, permissions, sessionId, email
        return {
            userId: payload.sub,
            tenantId: payload.tenantId,
            roles: payload.roles,
            permissions: payload.permissions,
            sessionId: payload.sessionId,
            email: payload.email,
        };
    }
}
