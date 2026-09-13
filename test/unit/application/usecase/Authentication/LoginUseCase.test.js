const { LoginUseCase } = require('../../../../../src/application/usecases/Authentication/LoginUseCase');
const { UsuarioRepository } = require('../../../../../src/domain/repository/UsuarioRepository');
const { BcryptHasher } = require('../../../../../src/application/ports/BcryptHasher');
const { JwtGenerator } = require('../../../../../src/application/ports/JwtGenerator');
const { CredencialesIncorrectasException } = require('../../../../../src/application/exception/CredencialesIncorrectasException');

describe('LoginUseCase', () => {
  let loginUseCase;
  let mockUsuarioRepository;
  let mockBcryptHasher;
  let mockJwtGenerator;
  let credencialesIncorrectasException;

  beforeEach(() => {
    mockUsuarioRepository = {
      findByEmail: jest.fn(),
    };
    mockBcryptHasher = {
      compararContrasenas: jest.fn(),
    };
    mockJwtGenerator = {
      firmarCredenciales: jest.fn(),
    };
    credencialesIncorrectasException = new CredencialesIncorrectasException();

    loginUseCase = new LoginUseCase({
      usuarioRepository: mockUsuarioRepository,
      bcryptHasher: mockBcryptHasher,
      jwtGenerator: mockJwtGenerator,
      credencialesIncorrectasException,
    });
  });

  it('debe autenticar un usuario correctamente', async () => {
    const mockUsuario = {
      idUsuario: 1,
      correo: 'test@mail.com',
      contrasena: 'hashed',
      rol: 'PACIENTE',
      nombres: 'Juan',
      apellidos: 'Perez',
    };

    mockUsuarioRepository.findByEmail.mockResolvedValue(mockUsuario);
    mockBcryptHasher.compararContrasenas.mockResolvedValue(true);
    mockJwtGenerator.firmarCredenciales.mockReturnValue('token123');

    const result = await loginUseCase.execute('test@mail.com', 'password');

    expect(mockUsuarioRepository.findByEmail).toHaveBeenCalledWith('test@mail.com');
    expect(mockBcryptHasher.compararContrasenas).toHaveBeenCalledWith('password', 'hashed');
    expect(mockJwtGenerator.firmarCredenciales).toHaveBeenCalledWith({
      correo: 'test@mail.com',
      rol: 'PACIENTE',
    });
    expect(result).toEqual({
      token: 'token123',
      usuario: {
        idUsuario: 1,
        nombres: 'Juan',
        apellidos: 'Perez',
        correo: 'test@mail.com',
        rol: 'PACIENTE',
      },
    });
  });

  it('debe lanzar CredencialesIncorrectasException si el usuario no existe', async () => {
    mockUsuarioRepository.findByEmail.mockResolvedValue(null);

    await expect(loginUseCase.execute('test@mail.com', 'password')).rejects.toThrow(CredencialesIncorrectasException);
    expect(mockBcryptHasher.compararContrasenas).not.toHaveBeenCalled();
  });

  it('debe lanzar CredencialesIncorrectasException si la contrasena es incorrecta', async () => {
    const mockUsuario = {
      idUsuario: 1,
      correo: 'test@mail.com',
      contrasena: 'hashed',
      rol: 'PACIENTE',
    };

    mockUsuarioRepository.findByEmail.mockResolvedValue(mockUsuario);
    mockBcryptHasher.compararContrasenas.mockResolvedValue(false);

    await expect(loginUseCase.execute('test@mail.com', 'wrong')).rejects.toThrow(CredencialesIncorrectasException);
    expect(mockJwtGenerator.firmarCredenciales).not.toHaveBeenCalled();
  });
});
