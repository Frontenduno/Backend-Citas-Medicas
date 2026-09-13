const { RegisterUseCase } = require('../../../../../src/application/usecases/Authentication/RegisterUseCase');
const { UsuarioRepository } = require('../../../../../src/domain/repository/UsuarioRepository');
const { PacienteRepository } = require('../../../../../src/domain/repository/PacienteRepository');
const { BcryptHasher } = require('../../../../../src/application/ports/BcryptHasher');
const { TransactionManager } = require('../../../../../src/application/ports/TransactionManager');
const { CorreoRegistradoException } = require('../../../../../src/application/exception/CorreoRegistradoException');
const { Usuario } = require('../../../../../src/domain/entity/Usuario');
const { Paciente } = require('../../../../../src/domain/entity/Paciente');

describe('RegisterUseCase', () => {
  let registerUseCase;
  let mockUsuarioRepository;
  let mockPacienteRepository;
  let mockBcryptHasher;
  let mockTransactionManager;
  let correoRegistradoException;

  beforeEach(() => {
    mockUsuarioRepository = {
      existsByEmail: jest.fn(),
      create: jest.fn(),
    };
    mockPacienteRepository = {
      create: jest.fn(),
    };
    mockBcryptHasher = {
      encriptarContrasena: jest.fn(),
    };
    mockTransactionManager = {
      withTransaction: jest.fn(),
    };
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
    });
  });

  it('debe registrar un nuevo paciente correctamente', async () => {
    const nuevoPaciente = {
      correo: 'test@mail.com',
      contrasena: 'password',
      nombres: 'Juan',
      apellidos: 'Perez',
      telefono: '999999999',
      DNI: '74192479',
      fecha_nacimiento: '1990-01-01',
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
    const nuevoPaciente = {
      correo: 'test@mail.com',
      contrasena: 'password',
      nombres: 'Juan',
      apellidos: 'Perez',
      telefono: '999999999',
      DNI: '74192479',
      fecha_nacimiento: '1990-01-01',
    };

    mockUsuarioRepository.existsByEmail.mockResolvedValue(true);

    await expect(registerUseCase.execute(nuevoPaciente)).rejects.toThrow(CorreoRegistradoException);
    expect(mockBcryptHasher.encriptarContrasena).not.toHaveBeenCalled();
  });
});
