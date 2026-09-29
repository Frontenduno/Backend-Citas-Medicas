import { IUsuarioRepository } from '../../../domain/repository/UsuarioRepository';
import { ICodigoVerificacionRepository } from '../../../domain/repository/ICodigoVerificacionRepository';
import { ITransactionManager } from '../../ports/TransactionManager';
import { CodigoVerificacionInvalidoException } from '../../exception/CodigoVerificacionInvalidoException';

export interface VerificarCorreoRequest {
  correo: string;
  codigo: string;
}

export interface VerificarCorreoUseCaseDependencies {
  usuarioRepository: IUsuarioRepository;
  codigoVerificacionRepository: ICodigoVerificacionRepository;
  transactionManager: ITransactionManager;
  codigoVerificacionInvalidoException: CodigoVerificacionInvalidoException;
}

export interface VerificarCorreoUseCaseResult {
  mensaje: string;
}

export class VerificarCorreoUseCase {
  private usuarioRepository: IUsuarioRepository;
  private codigoVerificacionRepository: ICodigoVerificacionRepository;
  private transactionManager: ITransactionManager;
  private codigoVerificacionInvalidoException: CodigoVerificacionInvalidoException;

  constructor(deps: VerificarCorreoUseCaseDependencies) {
    this.usuarioRepository = deps.usuarioRepository;
    this.codigoVerificacionRepository = deps.codigoVerificacionRepository;
    this.transactionManager = deps.transactionManager;
    this.codigoVerificacionInvalidoException = deps.codigoVerificacionInvalidoException;
  }

  async execute(request: VerificarCorreoRequest): Promise<VerificarCorreoUseCaseResult> {
    return await this.transactionManager.withTransaction(async (connection: any) => {
      // Buscar el código de verificación más reciente para este correo
      const codigoVerificacion = await this.codigoVerificacionRepository.findByCorreo(
        request.correo,
        connection,
      );

      if (!codigoVerificacion) {
        throw this.codigoVerificacionInvalidoException;
      }

      // Validar que el código coincida
      if (codigoVerificacion.codigo !== request.codigo) {
        throw this.codigoVerificacionInvalidoException;
      }

      // Validar que no haya expirado
      if (new Date() > codigoVerificacion.fecha_expiracion) {
        throw this.codigoVerificacionInvalidoException;
      }

      // Marcar al usuario como verificado
      await this.usuarioRepository.updateVerificado(request.correo, true, connection);

      // Eliminar todos los códigos de verificación para este correo
      await this.codigoVerificacionRepository.deleteByCorreo(request.correo, connection);

      return {
        mensaje: 'Correo verificado exitosamente. Tu cuenta ha sido activada.',
      };
    });
  }
}
