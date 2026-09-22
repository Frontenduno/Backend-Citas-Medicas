import { AppException } from './AppException';

export class CredencialesIncorrectasException extends AppException {
  readonly code = 'CREDENCIALES_INCORRECTAS';
  readonly httpStatus = 401;

  constructor(message: string = 'Credenciales Incorrectas') {
    super(message);
  }
}
