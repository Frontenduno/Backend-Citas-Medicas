export interface Logger {
  info(mensaje: string, meta?: Record<string, unknown>): void;
  warn(mensaje: string, meta?: Record<string, unknown>): void;
  error(mensaje: string, error?: Error, meta?: Record<string, unknown>): void;
}

