import { MySQLUserRepository } from '../../../src/infrastructure/repositories/MySQLUserRepository';
import { Usuario } from '../../../src/domain/entity/Usuario';
import { closeConnection, getConnection } from '../../../src/infrastructure/database/PoolConexion';

describe('UsuarioRepositoryMySQL', () => {
  afterAll(async () => {
    await closeConnection();
  });

  test('El email ingresado debe existir en la base de datos', async () => {
    const repository = new MySQLUserRepository();
    const result = await repository.existsByEmail('carlos.mendoza@medico.com');
    expect(result).toBe(true);
  });

  test('El email ingresado no debe existir en la base de datos', async () => {
    const repository = new MySQLUserRepository();
    const result = await repository.existsByEmail('randomEmail@example.com');
    expect(result).toBe(false);
  });


  test('Debe retornar un usuario', async () => {
    const repository = new MySQLUserRepository();
    const result = await repository.findUsuariobyEmail('carlos.mendoza@medico.com');
    expect(result != null).toBe(true);
  });

  test('Debe ser nulo', async () => {
    const repository = new MySQLUserRepository();
    const result = await repository.findUsuariobyEmail('randomEmail@example.com');
    expect(result).toBe(null);
  });

  test('Debe registrar Usuario', async () => {
    const repository = new MySQLUserRepository();
    const connection = await getConnection();
    try {
      await connection.beginTransaction();
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

      const result = await repository.create(usuario, connection);
      expect(result).toBeGreaterThan(0);
      await connection.rollback();
    } finally {
      connection.release();
    }
  });
});
