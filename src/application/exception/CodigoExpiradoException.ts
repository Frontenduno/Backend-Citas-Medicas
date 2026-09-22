import { AppException } from './AppException';

export class CodigoExpiradoException extends AppException {
  readonly code = 'CODIGO_EXPIRADO';
  readonly httpStatus = 400;

  constructor(message: string = 'El código de verificación ha expirado') {
    super(message);
  }
}
