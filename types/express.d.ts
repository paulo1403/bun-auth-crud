import type { Request } from 'express';

export interface AuthRequest extends Request {
  authUser?: any;
}
