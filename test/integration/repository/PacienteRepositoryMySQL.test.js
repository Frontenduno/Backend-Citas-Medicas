const { PacienteRepositoryMySQL } = require('../../../src/infrastructure/repositories/PacienteRepositoryMySQL');
const { Paciente } = require('../../../src/domain/entity/Paciente');
const { UsuarioRepositoryMySQL } = require('../../../src/infrastructure/repositories/UserRepositoryMySQL');
const { Usuario } = require('../../../src/domain/entity/Usuario');
const { closeConnection } = require('../../../src/infrastructure/database/PoolConexion');

describe('PacienteRepositoryMySQL', () => {
  afterAll(async () => {
    await closeConnection();
  });

  test('Debe registrar paciente', async () => {
    const pacienteRepository = new PacienteRepositoryMySQL();
    const usuarioRepository = new UsuarioRepositoryMySQL();
    const email = `testing_${Date.now()}@test.com`;

    const usuario = new Usuario(
      null,
      'password123',
      'Usuario',
      'Rollback',
      email,
      '999999999',
      'Paciente',
    );

    const usuarioId = await usuarioRepository.create(usuario);

    const paciente = new Paciente(
      null,
      '74192479',
      '1990-05-14',
      usuarioId,
      null,
    );

    const pacienteId = await pacienteRepository.create(paciente);

    expect(pacienteId).toBeGreaterThan(0);
  });
});
