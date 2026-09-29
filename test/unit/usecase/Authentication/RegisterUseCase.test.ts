import { RegisterUseCase, NuevoPacienteRequest, RegisterUseCaseDependencies } from '../../../../src/application/usecases/Authentication/RegisterUseCase';
import { IUsuarioRepository } from '../../../../src/domain/repository/UsuarioRepository';
import { IPacienteRepository } from '../../../../src/domain/repository/PacienteRepository';
import { ICodigoVerificacionRepository } from '../../../../src/domain/repository/ICodigoVerificacionRepository';
import { IBcryptHasher } from '../../../../src/application/ports/BcryptHasher';
import { IEmailSender } from '../../../../src/application/ports/IEmailSender';
import { ITransactionManager } from '../../../../src/application/ports/TransactionManager';
import { CorreoRegistradoException } from '../../../../src/application/exception/CorreoRegistradoException';
import { Usuario } from '../../../../src/domain/entity/Usuario';
import { Paciente } from '../../../../src/domain/entity/Paciente';

describe('RegisterUseCase', () => {
  let registerUseCase: RegisterUseCase;
  let mockUsuarioRepository: jest.Mocked<IUsuarioRepository>;
  let mockPacienteRepository: jest.Mocked<IPacienteRepository>;
  let mockCodigoVerificacionRepository: jest.Mocked<ICodigoVerificacionRepository>;
  let mockBcryptHasher: jest.Mocked<IBcryptHasher>;
  let mockEmailSender: jest.Mocked<IEmailSender>;
  let mockTransactionManager: jest.Mocked<ITransactionManager>;
  let correoRegistradoException: CorreoRegistradoException;

  beforeEach(() => {
    mockUsuarioRepository = {
      findUsuariobyEmail: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<IUsuarioRepository>;

    mockPacienteRepository = {
      create: jest.fn(),
    } as unknown as jest.Mocked<IPacienteRepository>;

    mockCodigoVerificacionRepository = {
      create: jest.fn(),
      findByCorreo: jest.fn(),
      deleteByCorreo: jest.fn(),
    } as unknown as jest.Mocked<ICodigoVerificacionRepository>;

    mockBcryptHasher = {
      encriptarContrasena: jest.fn(),
    } as unknown as jest.Mocked<IBcryptHasher>;

    mockEmailSender = {
      enviarCodigoVerificacion: jest.fn(),
    } as unknown as jest.Mocked<IEmailSender>;

    mockTransactionManager = {
      withTransaction: jest.fn(),
    } as unknown as jest.Mocked<ITransactionManager>;

    correoRegistradoException = new CorreoRegistradoException();

    mockTransactionManager.withTransaction.mockImplementation(async (fn) => {
      const mockConnection = {};
      return await fn(mockConnection);
    });

    registerUseCase = new RegisterUseCase({
      usuarioRepository: mockUsuarioRepository,
      pacienteRepository: mockPacienteRepository,
      codigoVerificacionRepository: mockCodigoVerificacionRepository,
      bcryptHasher: mockBcryptHasher,
      emailSender: mockEmailSender,
      transactionManager: mockTransactionManager,
      correoRegistradoException,
    } as RegisterUseCaseDependencies);
  });

  it('debe registrar un nuevo paciente correctamente', async () => {
    const nuevoPaciente: NuevoPacienteRequest = {
      correo: 'test@mail.com',
      contrasena: 'password',
      nombres: 'Juan',
      apellidos: 'Perez',
      documento_identidad: '12345678',
      telefono: '999999999',
      fecha_nacimiento: '1990-01-01',
      genero: 'Masculino',
    };

    mockUsuarioRepository.findUsuariobyEmail.mockResolvedValue(null);
    mockBcryptHasher.encriptarContrasena.mockResolvedValue('hashed');
    mockUsuarioRepository.create.mockResolvedValue(10);
    mockPacienteRepository.create.mockResolvedValue(5);
    mockCodigoVerificacionRepository.deleteByCorreo.mockResolvedValue(undefined);
    mockCodigoVerificacionRepository.create.mockResolvedValue(1);
    mockEmailSender.enviarCodigoVerificacion.mockResolvedValue(undefined);

    const result = await registerUseCase.execute(nuevoPaciente);

    expect(mockUsuarioRepository.findUsuariobyEmail).toHaveBeenCalledWith('test@mail.com', expect.any(Object));
    expect(mockBcryptHasher.encriptarContrasena).toHaveBeenCalledWith('password');
    expect(mockUsuarioRepository.create).toHaveBeenCalledWith(
      expect.any(Usuario),
      expect.any(Object),
    );
    expect(mockPacienteRepository.create).toHaveBeenCalledWith(
      expect.any(Paciente),
      expect.any(Object),
    );
    expect(mockEmailSender.enviarCodigoVerificacion).toHaveBeenCalledWith(
      'test@mail.com',
      expect.any(String),
    );
    expect(result.mensaje).toBe('Se ha enviado un código de verificación a tu correo electrónico');
  });

  it('debe lanzar CorreoRegistradoException si el correo ya existe y está verificado', async () => {
    const nuevoPaciente: NuevoPacienteRequest = {
      correo: 'test@mail.com',
      contrasena: 'password',
      nombres: 'Juan',
      apellidos: 'Perez',
      documento_identidad: '12345678',
      telefono: '999999999',
      fecha_nacimiento: '1990-01-01',
      genero: 'Masculino',
    };

    const existingUsuario = new Usuario(
      1,
      'hashed',
      'Juan',
      'Perez',
      'test@mail.com',
      '999999999',
      '12345678',
      '1990-01-01',
      'Masculino',
      'Paciente',
      true,
    );

    mockUsuarioRepository.findUsuariobyEmail.mockResolvedValue(existingUsuario);

    await expect(registerUseCase.execute(nuevoPaciente)).rejects.toThrow(CorreoRegistradoException);
    expect(mockBcryptHasher.encriptarContrasena).not.toHaveBeenCalled();
  });
});
