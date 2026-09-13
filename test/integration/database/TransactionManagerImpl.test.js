const { TransactionManagerImpl } = require('../../../src/infrastructure/database/TransactionManagerImpl');
const { closeConnection } = require('../../../src/infrastructure/database/PoolConexion');
const { UsuarioRepositoryMySQL } = require('../../../src/infrastructure/repositories/UserRepositoryMySQL');
const { Usuario } = require('../../../src/domain/entity/Usuario');

describe('TransactionManagerImpl', () => {
  afterAll(async () => {
    await closeConnection();
  });

  test('debe hacer rollback cuando ocurre un error durante la operacion', async () => {
    const manager = new TransactionManagerImpl();
    const usuarioRepository = new UsuarioRepositoryMySQL();
    const email = `rollback_${Date.now()}@test.com`;

    const usuario = new Usuario(
      null,
      'password123',
      'Usuario',
      'Rollback',
      email,
      '999999999',
      'PACIENTE',
    );

    await expect(
      manager.withTransaction(async (connection) => {
        await usuarioRepository.create(usuario, connection);
        throw new Error('Error intencional para probar rollback');
      }),
    ).rejects.toThrow('Error intencional para probar rollback');

    const exists = await usuarioRepository.existsByEmail(email);
    expect(exists).toBe(false);
  });
});
