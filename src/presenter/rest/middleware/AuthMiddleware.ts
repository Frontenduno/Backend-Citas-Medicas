import { Request, Response, NextFunction } from 'express';
import { JwtGenerator, Payload } from '../../../application/port/JwtGenerator';

export interface AuthenticatedRequest extends Request {
  usuario?: Payload;
}

export function createAuthMiddleware(jwtGenerator: JwtGenerator) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // 1. Extraer access_token de cookies o del header Authorization Bearer
    let token = req.cookies?.access_token;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        message: 'Acceso denegado: No se proporcionó token de autenticación',
        code: 'NO_TOKEN',
      });
    }

    // 2. Verificar y decodificar el access_token
    try {
      const payload = await jwtGenerator.decodificarToken(token);
      req.usuario = payload;
      return next();
    } catch {
      return res.status(401).json({
        message: 'Acceso denegado: El access token ha expirado o es inválido',
        code: 'TOKEN_EXPIRED',
      });
    }
  };
}
