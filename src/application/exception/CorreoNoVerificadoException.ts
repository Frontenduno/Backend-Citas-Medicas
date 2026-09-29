export class CorreoNoVerificadoException extends Error {
  constructor() {
    super('Debe verificar su correo electrónico antes de iniciar sesión');
    this.name = 'CorreoNoVerificadoException';
    Error.captureStackTrace(this, CorreoNoVerificadoException);
  }
}
