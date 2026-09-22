import { AppException } from './AppException';

export class ValidacionException extends AppException {
  readonly code = 'VALIDACION';
  readonly httpStatus = 400;

  constructor(message: string) {
    super(message);
  }
}

