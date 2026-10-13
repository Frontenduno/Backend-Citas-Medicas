import { IniciarSesionUseCase } from '../../../src/application/usecase/auth/IniciarSesionUseCase';
import { PrismaUsuarioRepository } from '../../../src/infrastructure/repository/PrismaUsuarioRepository';
import { PrismaRefreshTokenRepository } from '../../../src/infrastructure/repository/PrismaRefreshTokenRepository';
import { BcryptPasswordHasher } from '../../../src/infrastructure/service/BcryptPasswordHasher';
import { JsonWebTokenGenerator } from '../../../src/infrastructure/service/JsonWebTokenGenerator';
import { Usuario } from '../../../src/domain/entity/Usuario';
import { Rol } from '../../../src/domain/enum/Rol';
import { Genero } from '../../../src/domain/enum/Genero';
import { CredencialesIncorrectasException } from '../../../src/application/exception/CredencialesIncorrectasException';
import { CorreoNoVerificadoException } from '../../../src/application/exception/CorreoNoVerificadoException';
import { cleanDatabase, disconnectDatabase } from '../helpers/testDb';

describe('IniciarSesionUseCase Integration Tests', () => {
  const usuarioRepository = new PrismaUsuarioRepository();
  const refreshTokenRepository = new PrismaRefreshTokenRepository();
  const passwordHasher = new BcryptPasswordHasher();
  const jwtGenerator = new JsonWebTokenGenerator('integration-test-secret', '15m');
  const useCase = new IniciarSesionUseCase(
    usuarioRepository,
    jwtGenerator,
    passwordHasher,
    refreshTokenRepository
  );

  beforeAll(async () => {
    await cleanDatabase();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
    await disconnectDatabase();
  });

  const seedUsuario = async (
    correo: string,
    plainPassword: string,
    verificado: boolean = true
  ) => {
    const hashed = await passwordHasher.hashearContrasena(plainPassword);
    const usuario = new Usuario(
      0,
      hashed,
      'Login',
      'User',
      correo,
      '98765432',
      '955444333',
      Genero.MASCULINO,
      new Date('1992-06-15'),
      Rol.PACIENTE,
      verificado
    );
    return await usuarioRepository.save(usuario);
  };

  it('debe iniciar sesión exitosamente, retornar access y refresh tokens y persistir el refresh token en la BD', async () => {
    const correo = 'login_success@test.com';
    const contrasena = 'MiPasswordValido123';
    const user = await seedUsuario(correo, contrasena, true);

    const tokens = await useCase.ejecutar({ correo, contrasena });

    expect(tokens.accessToken).toBeDefined();
    expect(tokens.refreshToken).toBeDefined();

    // Validar token de acceso
    const decodedAccess = await jwtGenerator.decodificarToken(tokens.accessToken);
    expect(decodedAccess.correo).toBe(correo);
    expect(decodedAccess.idUsuario).toBe(user.idUsuario.toString());

    // Validar persistencia en base de datos
    const tokenDb = await refreshTokenRepository.findByToken(tokens.refreshToken);
    expect(tokenDb).not.toBeNull();
    expect(tokenDb?.idUsuario).toBe(user.idUsuario);
    expect(tokenDb?.revocado).toBe(false);
  });

  it('debe lanzar CredencialesIncorrectasException si la contraseña es incorrecta', async () => {
    const correo = 'wrong_pass@test.com';
    await seedUsuario(correo, 'PasswordCorrecta', true);

    await expect(
      useCase.ejecutar({ correo, contrasena: 'PasswordErrada' })
    ).rejects.toThrow(CredencialesIncorrectasException);
  });

  it('debe lanzar CredencialesIncorrectasException si el correo no existe en la BD', async () => {
    await expect(
      useCase.ejecutar({ correo: 'no_existe@test.com', contrasena: '123456' })
    ).rejects.toThrow(CredencialesIncorrectasException);
  });

  it('debe lanzar CorreoNoVerificadoException si el usuario aún no ha verificado su cuenta', async () => {
    const correo = 'unverified@test.com';
    const contrasena = 'PasswordValida';
    await seedUsuario(correo, contrasena, false);

    await expect(
      useCase.ejecutar({ correo, contrasena })
    ).rejects.toThrow(CorreoNoVerificadoException);
  });
});
