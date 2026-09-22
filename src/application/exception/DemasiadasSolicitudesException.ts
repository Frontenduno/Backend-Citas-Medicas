import { AppException } from './AppException';

export class DemasiadasSolicitudesException extends AppException {
  readonly code = 'DEMASIADAS_SOLICITUDES';
  readonly httpStatus = 429;

  constructor(message: string = 'Has realizado demasiadas solicitudes en muy poco tiempo. Intenta más tarde.') {
    super(message);
  }
}

