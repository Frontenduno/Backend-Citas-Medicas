import { AppException } from './AppException';

export class CodigoIncorrectoException extends AppException {
  readonly code = 'CODIGO_INCORRECTO';
  readonly httpStatus = 400;

  constructor(message: string = 'El código de verificación es incorrecto') {
    super(message);
  }
}
