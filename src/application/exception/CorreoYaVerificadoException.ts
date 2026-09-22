import { AppException } from './AppException';

export class CorreoYaVerificadoException extends AppException {
  readonly code = 'CORREO_YA_VERIFICADO';
  readonly httpStatus = 400;

  constructor(message: string = 'Este correo electrónico ya ha sido verificado') {
    super(message);
  }
}
