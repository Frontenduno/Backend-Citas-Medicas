const { UsuarioRepositoryMySQL } = require('../../../src/infrastructure/repositories/UserRepositoryMySQL');
const { Usuario } = require('../../../src/domain/entity/Usuario');
const { closeConnection } = require('../../../src/infrastructure/database/PoolConexion');

describe('UsuarioRepositoryMySQL', () => {
  afterAll(async () => {
    await closeConnection();
  });

  test('El email ingresado debe existir en la base de datos', async () => {
    const repository = new UsuarioRepositoryMySQL();
    const result = await repository.existsByEmail('carlos.gomez@mail.com');
    expect(result).toBe(true);
  });

  test('El email ingresado no debe existir en la base de datos', async () => {
    const repository = new UsuarioRepositoryMySQL();
    const result = await repository.existsByEmail('randomEmail@example.com');
    expect(result).toBe(false);
  });

  test('El email ingresado debe existir en la base de datos', async () => {
    const repository = new UsuarioRepositoryMySQL();
    const result = await repository.existsByEmail('jorge.castro@mail.com');
    expect(result).toBe(true);
  });

  test('Debe retornar un usuario', async () => {
    const repository = new UsuarioRepositoryMySQL();
    const result = await repository.findByEmail('jorge.castro@mail.com');
    expect(result != null).toBe(true);
  });

  test('Debe ser nulo', async () => {
    const repository = new UsuarioRepositoryMySQL();
    const result = await repository.findByEmail('randomEmail@example.com');
    expect(result).toBe(null);
  });

  test('Debe registrar Usuario', async () => {
    const repository = new UsuarioRepositoryMySQL();
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

    const result = await repository.create(usuario);
    expect(result).toBeGreaterThan(0);
  });
});
