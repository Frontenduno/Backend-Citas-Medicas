import { Request, Response, NextFunction } from 'express';
import { AppException } from '../../application/exception/AppException';
import { Logger } from '../../application/ports/Logger';

export function createErrorHandler(logger: Logger) {
  return function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] || 'desconocido';
    
    if (err instanceof AppException) {
      logger.warn(`Error de aplicación: ${err.message}`, { 
        requestId,
        code: err.code,
        status: err.httpStatus 
      });

      return res.status(err.httpStatus).json({
        error: {
          code: err.code,
          message: err.message
        }
      });
    }

    logger.error(`Error interno no controlado`, err, { requestId });

    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error interno del servidor'
      }
    });
  }
}

