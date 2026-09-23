import { RegisterUseCase, NuevoPacienteRequest, RegisterUseCaseDependencies } from '../../../../src/application/usecases/Authentication/RegisterUseCase';
import { IUsuarioRepository } from '../../../../src/domain/repository/UsuarioRepository';
import { IPacienteRepository } from '../../../../src/domain/repository/PacienteRepository';
import { IBcryptHasher } from '../../../../src/application/ports/BcryptHasher';
import { ITransactionManager } from '../../../../src/application/ports/TransactionManager';
import { CorreoRegistradoException } from '../../../../src/application/exception/CorreoRegistradoException';
import { Usuario } from '../../../../src/domain/entity/Usuario';
import { Paciente } from '../../../../src/domain/entity/Paciente';

describe('RegisterUseCase', () => {
  let registerUseCase: RegisterUseCase;
  let mockUsuarioRepository: jest.Mocked<IUsuarioRepository>;
  let mockPacienteRepository: jest.Mocked<IPacienteRepository>;
  let mockBcryptHasher: jest.Mocked<IBcryptHasher>;
  let mockTransactionManager: jest.Mocked<ITransactionManager>;
  let correoRegistradoException: CorreoRegistradoException;

  beforeEach(() => {
    mockUsuarioRepository = {
      existsByEmail: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<IUsuarioRepository>;

    mockPacienteRepository = {
      create: jest.fn(),
    } as unknown as jest.Mocked<IPacienteRepository>;

    mockBcryptHasher = {
      encriptarContrasena: jest.fn(),
    } as unknown as jest.Mocked<IBcryptHasher>;

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
      bcryptHasher: mockBcryptHasher,
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
      telefono: '999999999',
      fecha_nacimiento: '1990-01-01',
      genero: 'Masculino',
    };

    mockUsuarioRepository.existsByEmail.mockResolvedValue(false);
    mockBcryptHasher.encriptarContrasena.mockResolvedValue('hashed');
    mockUsuarioRepository.create.mockResolvedValue(10);
    mockPacienteRepository.create.mockResolvedValue(5);

    const result = await registerUseCase.execute(nuevoPaciente);

    expect(mockUsuarioRepository.existsByEmail).toHaveBeenCalledWith('test@mail.com', expect.any(Object));
    expect(mockBcryptHasher.encriptarContrasena).toHaveBeenCalledWith('password');
    expect(mockUsuarioRepository.create).toHaveBeenCalledWith(
      expect.any(Usuario),
      expect.any(Object),
    );
    expect(mockPacienteRepository.create).toHaveBeenCalledWith(
      expect.any(Paciente),
      expect.any(Object),
    );
    expect(result.idUsuario).toBe(10);
  });

  it('debe lanzar CorreoRegistradoException si el correo ya existe', async () => {
    const nuevoPaciente: NuevoPacienteRequest = {
      correo: 'test@mail.com',
      contrasena: 'password',
      nombres: 'Juan',
      apellidos: 'Perez',
      telefono: '999999999',
      fecha_nacimiento: '1990-01-01',
      genero: 'Masculino',
    };

    mockUsuarioRepository.existsByEmail.mockResolvedValue(true);

    await expect(registerUseCase.execute(nuevoPaciente)).rejects.toThrow(CorreoRegistradoException);
    expect(mockBcryptHasher.encriptarContrasena).not.toHaveBeenCalled();
  });
});
