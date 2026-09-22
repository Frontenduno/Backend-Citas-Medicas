import { LoginUseCase, LoginUseCaseDependencies } from '../../../../src/application/usecases/Authentication/LoginUseCase';
import { IUsuarioRepository } from '../../../../src/domain/repository/UsuarioRepository';
import { IBcryptHasher } from '../../../../src/application/ports/BcryptHasher';
import { IJwtGenerator } from '../../../../src/application/ports/JwtGenerator';
import { CredencialesIncorrectasException } from '../../../../src/application/exception/CredencialesIncorrectasException';

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  let mockUsuarioRepository: jest.Mocked<IUsuarioRepository>;
  let mockBcryptHasher: jest.Mocked<IBcryptHasher>;
  let mockJwtGenerator: jest.Mocked<IJwtGenerator>;
  let credencialesIncorrectasException: CredencialesIncorrectasException;

  beforeEach(() => {
    mockUsuarioRepository = {
      findByEmail: jest.fn(),
    } as unknown as jest.Mocked<IUsuarioRepository>;

    mockBcryptHasher = {
      compararContrasenas: jest.fn(),
    } as unknown as jest.Mocked<IBcryptHasher>;

    mockJwtGenerator = {
      firmarCredenciales: jest.fn(),
    } as unknown as jest.Mocked<IJwtGenerator>;

    credencialesIncorrectasException = new CredencialesIncorrectasException();

    loginUseCase = new LoginUseCase({
      usuarioRepository: mockUsuarioRepository,
      bcryptHasher: mockBcryptHasher,
      jwtGenerator: mockJwtGenerator,
      credencialesIncorrectasException,
    } as LoginUseCaseDependencies);
  });

  it('debe autenticar un usuario correctamente', async () => {
    const mockUsuario = {
      idUsuario: 1,
      correo: 'test@mail.com',
      contrasena: 'hashed',
      rol: 'PACIENTE',
      nombres: 'Juan',
      apellidos: 'Perez',
      telefono: '999999999',
      fecha_nacimiento: '1990-01-01',
      genero: 'Masculino',
    };

    mockUsuarioRepository.findByEmail.mockResolvedValue(mockUsuario as any);
    mockBcryptHasher.compararContrasenas.mockResolvedValue(true);
    mockJwtGenerator.firmarCredenciales.mockReturnValue('token123');

    const result = await loginUseCase.execute('test@mail.com', 'password');

    expect(mockUsuarioRepository.findByEmail).toHaveBeenCalledWith('test@mail.com');
    expect(mockBcryptHasher.compararContrasenas).toHaveBeenCalledWith('password', 'hashed');
    expect(mockJwtGenerator.firmarCredenciales).toHaveBeenCalledWith({
      id: 1,
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
      nombres: 'Juan',
      apellidos: 'Perez',
      telefono: '999999999',
      fecha_nacimiento: '1990-01-01',
      genero: 'Masculino',
    };

    mockUsuarioRepository.findByEmail.mockResolvedValue(mockUsuario as any);
    mockBcryptHasher.compararContrasenas.mockResolvedValue(false);

    await expect(loginUseCase.execute('test@mail.com', 'wrong')).rejects.toThrow(CredencialesIncorrectasException);
    expect(mockJwtGenerator.firmarCredenciales).not.toHaveBeenCalled();
  });
});
