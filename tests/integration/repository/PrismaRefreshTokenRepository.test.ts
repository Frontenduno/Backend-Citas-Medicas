import { PrismaRefreshTokenRepository } from '../../../src/infrastructure/repository/PrismaRefreshTokenRepository';
import { PrismaUsuarioRepository } from '../../../src/infrastructure/repository/PrismaUsuarioRepository';
import { RefreshToken } from '../../../src/domain/entity/RefreshToken';
import { Usuario } from '../../../src/domain/entity/Usuario';
import { Rol } from '../../../src/domain/enum/Rol';
import { Genero } from '../../../src/domain/enum/Genero';
import { cleanDatabase, disconnectDatabase } from '../helpers/testDb';

describe('PrismaRefreshTokenRepository Integration Tests', () => {
  const repository = new PrismaRefreshTokenRepository();
  const usuarioRepo = new PrismaUsuarioRepository();

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

  const seedUsuario = async (correo: string = 'tokenuser@test.com'): Promise<Usuario> => {
    const usuario = new Usuario(
      0,
      'hashed_pwd',
      'Token',
      'User',
      correo,
      '99887766',
      '987123456',
      Genero.MASCULINO,
      new Date('1990-01-01'),
      Rol.PACIENTE,
      true
    );
    return await usuarioRepo.save(usuario);
  };

  it('debe persistir un RefreshToken en la BD de prueba (save)', async () => {
    const usuario = await seedUsuario();
    const token = new RefreshToken(
      0,
      'sample.refresh.token.1',
      usuario.idUsuario,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      false
    );

    const guardado = await repository.save(token);

    expect(guardado.idRefreshToken).toBeGreaterThan(0);
    expect(guardado.token).toBe('sample.refresh.token.1');
    expect(guardado.idUsuario).toBe(usuario.idUsuario);
    expect(guardado.revocado).toBe(false);
  });

  it('debe encontrar un RefreshToken por su cadena (findByToken)', async () => {
    const usuario = await seedUsuario();
    const tokenStr = 'sample.refresh.token.find';
    await repository.save(
      new RefreshToken(0, tokenStr, usuario.idUsuario, new Date(Date.now() + 60000), false)
    );

    const encontrado = await repository.findByToken(tokenStr);

    expect(encontrado).not.toBeNull();
    expect(encontrado?.token).toBe(tokenStr);
    expect(encontrado?.idUsuario).toBe(usuario.idUsuario);
  });

  it('debe marcar como revocado un token específico (revokeByToken)', async () => {
    const usuario = await seedUsuario();
    const tokenStr = 'sample.refresh.token.revoke';
    await repository.save(
      new RefreshToken(0, tokenStr, usuario.idUsuario, new Date(Date.now() + 60000), false)
    );

    await repository.revokeByToken(tokenStr);

    const revocado = await repository.findByToken(tokenStr);
    expect(revocado?.revocado).toBe(true);
  });

  it('debe revocar todos los tokens de un usuario (revokeAllByUsuario)', async () => {
    const usuario = await seedUsuario();
    await repository.save(
      new RefreshToken(0, 'token.user.1', usuario.idUsuario, new Date(Date.now() + 60000), false)
    );
    await repository.save(
      new RefreshToken(0, 'token.user.2', usuario.idUsuario, new Date(Date.now() + 60000), false)
    );

    await repository.revokeAllByUsuario(usuario.idUsuario);

    const t1 = await repository.findByToken('token.user.1');
    const t2 = await repository.findByToken('token.user.2');
    expect(t1?.revocado).toBe(true);
    expect(t2?.revocado).toBe(true);
  });

  it('debe eliminar un token de la BD (deleteByToken)', async () => {
    const usuario = await seedUsuario();
    await repository.save(
      new RefreshToken(0, 'token.to.delete', usuario.idUsuario, new Date(Date.now() + 60000), false)
    );

    await repository.deleteByToken('token.to.delete');

    const check = await repository.findByToken('token.to.delete');
    expect(check).toBeNull();
  });
});
