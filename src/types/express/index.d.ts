// src/types/express/index.d.ts
import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    export interface Request {
      user?: string | JwtPayload;
    }
  }
}
