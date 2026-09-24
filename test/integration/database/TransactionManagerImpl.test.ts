import { TransactionManagerImpl } from '../../../src/infrastructure/database/TransactionManagerImpl';
import { closeConnection } from '../../../src/infrastructure/database/PoolConexion';
import { MySQLUserRepository } from '../../../src/infrastructure/repositories/MySQLUserRepository';
import { Usuario } from '../../../src/domain/entities/Usuario';

describe('TransactionManagerImpl', () => {
  afterAll(async () => {
    await closeConnection();
  });

  test('debe hacer rollback cuando ocurre un error durante la operacion', async () => {
    const manager = new TransactionManagerImpl();
    const usuarioRepository = new MySQLUserRepository();
    const email = `rollback_${Date.now()}@test.com`;

    const usuario = new Usuario(
      null,
      'password123',
      'Usuario',
      'Rollback',
      email,
      '999999999',
      '1990-01-01',
      'Masculino',
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
