import { BaseException } from './BaseException';

export class TokenInvalidoException extends BaseException {
  constructor(message: string = 'El token de actualización es inválido o ha expirado') {
    super(message);
  }
}
