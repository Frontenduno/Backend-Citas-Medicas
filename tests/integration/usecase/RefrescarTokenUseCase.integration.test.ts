import { RefrescarTokenUseCase } from '../../../src/application/usecase/auth/RefrescarTokenUseCase';
import { PrismaRefreshTokenRepository } from '../../../src/infrastructure/repository/PrismaRefreshTokenRepository';
import { PrismaUsuarioRepository } from '../../../src/infrastructure/repository/PrismaUsuarioRepository';
import { JsonWebTokenGenerator } from '../../../src/infrastructure/service/JsonWebTokenGenerator';
import { PrismaTransactionManager } from '../../../src/infrastructure/database/PrismaTransactionManager';
import { RefreshTokenRepository } from '../../../src/domain/repository/RefreshTokenRepository';
import { Usuario } from '../../../src/domain/entity/Usuario';
import { RefreshToken } from '../../../src/domain/entity/RefreshToken';
import { Rol } from '../../../src/domain/enum/Rol';
import { Genero } from '../../../src/domain/enum/Genero';
import { TokenInvalidoException } from '../../../src/application/exception/TokenInvalidoException';
import { cleanDatabase, disconnectDatabase } from '../helpers/testDb';

class RefreshTokenRepositoryQueFallaAlGuardar implements RefreshTokenRepository {
  constructor(private readonly real: RefreshTokenRepository) {}

  async save(_refreshToken: RefreshToken): Promise<RefreshToken> {
    throw new Error('Fallo simulado al guardar el token');
  }

  findByToken(token: string) {
    return this.real.findByToken(token);
  }

  revokeByToken(token: string) {
    return this.real.revokeByToken(token);
  }

  revokeAllByUsuario(idUsuario: number) {
    return this.real.revokeAllByUsuario(idUsuario);
  }

  deleteByToken(token: string) {
    return this.real.deleteByToken(token);
  }
}

describe('RefrescarTokenUseCase Integration Tests', () => {
  const usuarioRepository = new PrismaUsuarioRepository();
  const refreshTokenRepository = new PrismaRefreshTokenRepository();
  const jwtGenerator = new JsonWebTokenGenerator('integration-secret', '15m');
  const transactionManager = new PrismaTransactionManager();
  const useCase = new RefrescarTokenUseCase(
    refreshTokenRepository,
    usuarioRepository,
    jwtGenerator,
    transactionManager
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

  const seedUsuario = async (correo: string = 'refresh@test.com'): Promise<Usuario> => {
    const usuario = new Usuario(
      0,
      'hashed_pwd',
      'Test',
      'User',
      correo,
      '88776655',
      '912345678',
      Genero.MASCULINO,
      new Date('1990-01-01'),
      Rol.PACIENTE,
      true
    );
    return await usuarioRepository.save(usuario);
  };

  it('debe rotar el refresh token, emitir nuevo access token y persistir en MySQL', async () => {
    const usuario = await seedUsuario();
    const payload = {
      correo: usuario.correo,
      idUsuario: usuario.idUsuario.toString(),
      rol: usuario.rol,
    };
    const oldRefreshToken = await jwtGenerator.generarRefreshToken(payload);
    await refreshTokenRepository.save(
      new RefreshToken(
        0,
        oldRefreshToken,
        usuario.idUsuario,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        false
      )
    );

    const tokens = await useCase.ejecutar(oldRefreshToken);

    expect(tokens.accessToken).toBeDefined();
    expect(tokens.refreshToken).toBeDefined();
    expect(tokens.refreshToken).not.toBe(oldRefreshToken);

    // Old token must be revoked in DB
    const oldDb = await refreshTokenRepository.findByToken(oldRefreshToken);
    expect(oldDb?.revocado).toBe(true);

    // New token must exist and not be revoked in DB
    const newDb = await refreshTokenRepository.findByToken(tokens.refreshToken);
    expect(newDb).not.toBeNull();
    expect(newDb?.revocado).toBe(false);
  });

  it('debe rechazar un token ya revocado en la BD', async () => {
    const usuario = await seedUsuario();
    const payload = {
      correo: usuario.correo,
      idUsuario: usuario.idUsuario.toString(),
      rol: usuario.rol,
    };
    const revokedToken = await jwtGenerator.generarRefreshToken(payload);

    await refreshTokenRepository.save(
      new RefreshToken(
        0,
        revokedToken,
        usuario.idUsuario,
        new Date(Date.now() + 60000),
        true // ya revocado
      )
    );

    await expect(useCase.ejecutar(revokedToken)).rejects.toThrow(TokenInvalidoException);
  });

  it('debe revertir la revocación del token anterior si falla el guardado del nuevo', async () => {
    const usuario = await seedUsuario('refresh_rollback@test.com');
    const payload = {
      correo: usuario.correo,
      idUsuario: usuario.idUsuario.toString(),
      rol: usuario.rol,
    };
    const oldRefreshToken = await jwtGenerator.generarRefreshToken(payload);
    await refreshTokenRepository.save(
      new RefreshToken(
        0,
        oldRefreshToken,
        usuario.idUsuario,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        false
      )
    );

    const failingUseCase = new RefrescarTokenUseCase(
      new RefreshTokenRepositoryQueFallaAlGuardar(refreshTokenRepository),
      usuarioRepository,
      jwtGenerator,
      transactionManager
    );

    await expect(failingUseCase.ejecutar(oldRefreshToken)).rejects.toThrow(
      'Fallo simulado al guardar el token'
    );

    // El token anterior no debe quedar revocado si la rotación falla
    const oldDb = await refreshTokenRepository.findByToken(oldRefreshToken);
    expect(oldDb?.revocado).toBe(false);
    expect(oldDb?.esValido()).toBe(true);
  });
});
