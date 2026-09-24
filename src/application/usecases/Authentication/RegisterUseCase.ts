import { Usuario } from '../../../domain/entities/Usuario';
import { Paciente } from '../../../domain/entities/Paciente';
import { IUsuarioRepository } from '../../../domain/repositories/UsuarioRepository';
import { IPacienteRepository } from '../../../domain/repositories/PacienteRepository';
import { IBcryptHasher } from '../../ports/BcryptHasher';
import { ITransactionManager } from '../../ports/TransactionManager';
import { CorreoRegistradoException } from '../../exception/CorreoRegistradoException';

export interface NuevoPacienteRequest {
  correo: string;
  contrasena: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  fecha_nacimiento: string;
  genero: string;
}

export interface RegisterUseCaseDependencies {
  usuarioRepository: IUsuarioRepository;
  pacienteRepository: IPacienteRepository;
  bcryptHasher: IBcryptHasher;
  transactionManager: ITransactionManager;
  correoRegistradoException: CorreoRegistradoException;
}

export interface RegisterUseCaseResult {
  idUsuario: number;
}

export class RegisterUseCase {
  private usuarioRepository: IUsuarioRepository;
  private pacienteRepository: IPacienteRepository;
  private bcryptHasher: IBcryptHasher;
  private transactionManager: ITransactionManager;
  private correoRegistradoException: CorreoRegistradoException;

  constructor(deps: RegisterUseCaseDependencies) {
    this.usuarioRepository = deps.usuarioRepository;
    this.pacienteRepository = deps.pacienteRepository;
    this.bcryptHasher = deps.bcryptHasher;
    this.transactionManager = deps.transactionManager;
    this.correoRegistradoException = deps.correoRegistradoException;
  }

  async execute(nuevoPaciente: NuevoPacienteRequest): Promise<RegisterUseCaseResult> {
    return await this.transactionManager.withTransaction(async (connection: any) => {
      if (await this.usuarioRepository.existsByEmail(nuevoPaciente.correo, connection)) {
        throw this.correoRegistradoException;
      }

      const contrasenaHasheada = await this.bcryptHasher.encriptarContrasena(nuevoPaciente.contrasena);

      const newUsuario = new Usuario(
        null,
        contrasenaHasheada,
        nuevoPaciente.nombres,
        nuevoPaciente.apellidos,
        nuevoPaciente.correo,
        nuevoPaciente.telefono,
        nuevoPaciente.fecha_nacimiento,
        nuevoPaciente.genero,
        'Paciente',
      );

      const createdIdUsuario = await this.usuarioRepository.create(newUsuario, connection);

      const newPaciente = new Paciente(
        null,
        createdIdUsuario,
      );

      await this.pacienteRepository.create(newPaciente, connection);

      return { idUsuario: createdIdUsuario };
    });
  }
}
