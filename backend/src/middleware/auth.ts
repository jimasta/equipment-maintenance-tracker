import { NextFunction, Request, Response } from 'express';
import { Papel } from '@prisma/client';
import { AuthTokenPayload, verifyToken } from '../services/authService';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.header('Authorization');
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;

  if (!token) {
    res.status(401).json({ error: 'Token de autenticação ausente' });
    return;
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'Token de autenticação inválido ou expirado' });
  }
}

export function requireRole(...allowed: Papel[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Token de autenticação ausente' });
      return;
    }
    if (!allowed.includes(req.user.papel)) {
      res.status(403).json({ error: 'Sem permissão para acessar este recurso' });
      return;
    }
    next();
  };
}
