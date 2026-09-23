import { RegisterUseCase } from '../../../src/application/usecases/Authentication/RegisterUseCase';
import { MySQLUserRepository } from '../../../src/infrastructure/repositories/MySQLUserRepository';
import { PacienteRepositoryMySQL } from '../../../src/infrastructure/repositories/PacienteRepositoryMySQL';
import { BcryptHasherImpl } from '../../../src/infrastructure/service/BcryptHasherImpl';
import { TransactionManagerImpl } from '../../../src/infrastructure/database/TransactionManagerImpl';
import { CorreoRegistradoException } from '../../../src/application/exception/CorreoRegistradoException';
import { closeConnection } from '../../../src/infrastructure/database/PoolConexion';

describe('RegisterUseCase (Integration)', () => {
  afterAll(async () => {
    await closeConnection();
  });

  test('debe registrar un nuevo paciente', async () => {
    const registerUseCase = new RegisterUseCase({
      usuarioRepository: new MySQLUserRepository(),
      pacienteRepository: new PacienteRepositoryMySQL(),
      bcryptHasher: new BcryptHasherImpl(),
      transactionManager: new TransactionManagerImpl(),
      correoRegistradoException: new CorreoRegistradoException(),
    });

    const testUser = {
      correo: `juan.perez${Date.now()}@example.com`,
      contrasena: 'secreta123',
      nombres: 'Juan',
      apellidos: 'Perez',
      telefono: '987654321',
      fecha_nacimiento: '1990-01-01',
      genero: 'Masculino',
    };

    const result = await registerUseCase.execute(testUser);

    expect(result.idUsuario).toBeGreaterThan(0);
  });
});
