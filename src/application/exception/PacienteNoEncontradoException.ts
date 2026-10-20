import { BaseException } from './BaseException';

export class PacienteNoEncontradoException extends BaseException {
  constructor() {
    super('El usuario no tiene un perfil de paciente asociado');
  }
}
