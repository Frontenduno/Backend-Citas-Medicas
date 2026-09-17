import { PacienteRepositoryMySQL } from '../../../src/infrastructure/repositories/PacienteRepositoryMySQL';
import { Paciente } from '../../../src/domain/entity/Paciente';
import { UsuarioRepositoryMySQL } from '../../../src/infrastructure/repositories/UserRepositoryMySQL';
import { Usuario } from '../../../src/domain/entity/Usuario';
import { closeConnection, getConnection } from '../../../src/infrastructure/database/PoolConexion';

describe('PacienteRepositoryMySQL', () => {
  afterAll(async () => {
    await closeConnection();
  });

  test('Debe registrar paciente', async () => {
    const pacienteRepository = new PacienteRepositoryMySQL();
    const usuarioRepository = new UsuarioRepositoryMySQL();
    const connection = await getConnection();
    try {
      await connection.beginTransaction();
      const email = `testing_${Date.now()}@test.com`;

      const usuario = new Usuario(
        null,
        'password123',
        'Usuario',
        'Rollback',
        email,
        '999999999',
        '1990-01-01',
        'Masculino',
        'Paciente',
      );

      const usuarioId = await usuarioRepository.create(usuario, connection);

      const paciente = new Paciente(
        null,
        usuarioId,
      );

      const pacienteId = await pacienteRepository.create(paciente, connection);

      expect(pacienteId).toBeGreaterThan(0);
      await connection.rollback();
    } finally {
      connection.release();
    }
  });
});
