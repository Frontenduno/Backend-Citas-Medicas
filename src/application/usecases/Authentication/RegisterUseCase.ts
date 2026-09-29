import { Usuario } from '../../../domain/entity/Usuario';
import { Paciente } from '../../../domain/entity/Paciente';
import { CodigoVerificacion } from '../../../domain/entity/CodigoVerificacion';
import { IUsuarioRepository } from '../../../domain/repository/UsuarioRepository';
import { IPacienteRepository } from '../../../domain/repository/PacienteRepository';
import { ICodigoVerificacionRepository } from '../../../domain/repository/ICodigoVerificacionRepository';
import { IBcryptHasher } from '../../ports/BcryptHasher';
import { ITransactionManager } from '../../ports/TransactionManager';
import { IEmailSender } from '../../ports/IEmailSender';
import { CorreoRegistradoException } from '../../exception/CorreoRegistradoException';

export interface NuevoPacienteRequest {
  correo: string;
  contrasena: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  documento_identidad: string;
  fecha_nacimiento: string;
  genero: string;
}

export interface RegisterUseCaseDependencies {
  usuarioRepository: IUsuarioRepository;
  pacienteRepository: IPacienteRepository;
  codigoVerificacionRepository: ICodigoVerificacionRepository;
  bcryptHasher: IBcryptHasher;
  transactionManager: ITransactionManager;
  emailSender: IEmailSender;
  correoRegistradoException: CorreoRegistradoException;
}

export interface RegisterUseCaseResult {
  mensaje: string;
}

export class RegisterUseCase {
  private usuarioRepository: IUsuarioRepository;
  private pacienteRepository: IPacienteRepository;
  private codigoVerificacionRepository: ICodigoVerificacionRepository;
  private bcryptHasher: IBcryptHasher;
  private transactionManager: ITransactionManager;
  private emailSender: IEmailSender;
  private correoRegistradoException: CorreoRegistradoException;

  constructor(deps: RegisterUseCaseDependencies) {
    this.usuarioRepository = deps.usuarioRepository;
    this.pacienteRepository = deps.pacienteRepository;
    this.codigoVerificacionRepository = deps.codigoVerificacionRepository;
    this.bcryptHasher = deps.bcryptHasher;
    this.transactionManager = deps.transactionManager;
    this.emailSender = deps.emailSender;
    this.correoRegistradoException = deps.correoRegistradoException;
  }

  async execute(nuevoPaciente: NuevoPacienteRequest): Promise<RegisterUseCaseResult> {
    return await this.transactionManager.withTransaction(async (connection: any) => {
      // Verificar si ya existe un usuario verificado con este correo
      const usuarioExistente = await this.usuarioRepository.findUsuariobyEmail(nuevoPaciente.correo, connection);

      if (usuarioExistente && usuarioExistente.verificado) {
        throw this.correoRegistradoException;
      }

      // Si existe un usuario no verificado, se reutiliza el flujo:
      // se eliminan los códigos anteriores y se genera uno nuevo
      if (!usuarioExistente) {
        const contrasenaHasheada = await this.bcryptHasher.encriptarContrasena(nuevoPaciente.contrasena);

        const newUsuario = new Usuario(
          null,
          contrasenaHasheada,
          nuevoPaciente.nombres,
          nuevoPaciente.apellidos,
          nuevoPaciente.correo,
          nuevoPaciente.telefono,
          nuevoPaciente.documento_identidad,
          nuevoPaciente.fecha_nacimiento,
          nuevoPaciente.genero,
          'Paciente',
          false,
        );

        const createdIdUsuario = await this.usuarioRepository.create(newUsuario, connection);

        const newPaciente = new Paciente(
          null,
          createdIdUsuario,
        );

        await this.pacienteRepository.create(newPaciente, connection);
      }

      // Generar código de verificación de 6 dígitos
      const codigo = this.generarCodigo();
      const fechaExpiracion = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

      // Eliminar códigos previos para este correo
      await this.codigoVerificacionRepository.deleteByCorreo(nuevoPaciente.correo, connection);

      // Guardar nuevo código
      const codigoVerificacion = new CodigoVerificacion(
        null,
        nuevoPaciente.correo,
        codigo,
        fechaExpiracion,
        null,
      );
      await this.codigoVerificacionRepository.create(codigoVerificacion, connection);

      // Enviar correo con el código (fuera de la transacción no es ideal,
      // pero necesitamos que el código esté guardado antes de enviar)
      await this.emailSender.enviarCodigoVerificacion(nuevoPaciente.correo, codigo);

      return {
        mensaje: 'Se ha enviado un código de verificación a tu correo electrónico',
      };
    });
  }

  private generarCodigo(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
