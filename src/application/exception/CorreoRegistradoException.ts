import { AppException } from './AppException';

export class CorreoRegistradoException extends AppException {
  readonly code = 'CORREO_NO_REGISTRADO';
  readonly httpStatus = 404;

  constructor(message: string = 'Este correo no existe en esta plataforma...') {
    super(message);
  }
}
