/// Archivo: apps/api-core/src/common/security/password.service.ts
import { Injectable } from '@nestjs/common';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

@Injectable()
export class PasswordService {
  private readonly SCRYPT_LEN = 64;
  hash(plain: string): string {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(plain, salt, this.SCRYPT_LEN).toString('hex');
    return `$scrypt$1$${salt}$${hash}`;     // versión 1
  }
  verify(plain: string, stored: string): boolean {
    const [, , , salt, hashHex] = stored.split('$');
    const hashBuf = Buffer.from(hashHex, 'hex');
    const derived = scryptSync(plain, salt, hashBuf.length);
    return timingSafeEqual(hashBuf, derived);
  }
}
