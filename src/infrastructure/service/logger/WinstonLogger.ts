import { Logger } from '../../../application/ports/Logger';
import winston from 'winston';

export class WinstonLogger implements Logger {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console()
      ]
    });
  }

  info(mensaje: string, meta?: Record<string, unknown>): void {
    this.logger.info(mensaje, meta);
  }

  warn(mensaje: string, meta?: Record<string, unknown>): void {
    this.logger.warn(mensaje, meta);
  }

  error(mensaje: string, error?: Error, meta?: Record<string, unknown>): void {
    this.logger.error(mensaje, { 
      ...meta,
      errorName: error?.name,
      errorMessage: error?.message,
      stack: error?.stack 
    });
  }
}

