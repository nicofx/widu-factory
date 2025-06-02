import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { Request as ExpressRequest } from 'express';

interface AuthenticatedRequest extends ExpressRequest {
  user?: {
    sub: string;
    email: string;
    role: string;
    tenant: string;
    [key: string]: any;
  };
  tenant?: string;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    if (req.user?.tenant) {
      req.tenant = req.user.tenant;
    } else {
      req.tenant = 'default';
    }
    next();
  }
}
