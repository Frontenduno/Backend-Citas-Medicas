export class CodigoVerificacionInvalidoException extends Error {
  constructor() {
    super('El código de verificación es inválido o ha expirado');
    this.name = 'CodigoVerificacionInvalidoException';
    Error.captureStackTrace(this, CodigoVerificacionInvalidoException);
  }
}
