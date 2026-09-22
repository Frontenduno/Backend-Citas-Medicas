import { AppException } from './AppException';

export class DemasiadosIntentosException extends AppException {
  readonly code = 'DEMASIADOS_INTENTOS';
  readonly httpStatus = 429;

  constructor(message: string = 'Has superado el límite de intentos permitidos') {
    super(message);
  }
}
