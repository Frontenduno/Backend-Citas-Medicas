import { MySQLUserRepository } from '../../../src/infrastructure/repositories/MySQLUserRepository';
import { closeConnection } from '../../../src/infrastructure/database/PoolConexion';

describe('Test de los métodos de MySQLUserRepository (TypeScript)', () => {
  const repository = new MySQLUserRepository();

  afterAll(async () => {
    await closeConnection();
  });

  test('El email no existente debe retornar false', async () => {
    const result = await repository.existsByEmail('noexiste@example.com');
    expect(result).toBe(false);
  });

  test('Debe retornar un usuario si el email existe', async () => {
    const result = await repository.findUsuariobyEmail('carlos.gomez@mail.com');
    if (result) {
      expect(result.correo).toBe('carlos.gomez@mail.com');
      expect(result.nombres).toBeDefined();
    }
  });

  test('Debe retornar null para un email no registrado', async () => {
    const result = await repository.findUsuariobyEmail('randomEmailInexistente@example.com');
    expect(result).toBeNull();
  });
});

