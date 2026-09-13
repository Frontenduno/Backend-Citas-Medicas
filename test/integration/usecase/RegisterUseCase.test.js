const { RegisterUseCase } = require('../../../src/application/usecases/Authentication/RegisterUseCase');
const { UsuarioRepositoryMySQL } = require('../../../src/infrastructure/repositories/UserRepositoryMySQL');
const { PacienteRepositoryMySQL } = require('../../../src/infrastructure/repositories/PacienteRepositoryMySQL');
const { BcryptHasherImpl } = require('../../../src/infrastructure/service/BcryptHasherImpl');
const { TransactionManagerImpl } = require('../../../src/infrastructure/database/TransactionManagerImpl');
const { CorreoRegistradoException } = require('../../../src/application/exception/CorreoRegistradoException');
const { closeConnection } = require('../../../src/infrastructure/database/PoolConexion');

describe('RegisterUseCase (Integration)', () => {
  afterAll(async () => {
    await closeConnection();
  });

  test('debe registrar un nuevo paciente', async () => {
    const registerUseCase = new RegisterUseCase({
      usuarioRepository: new UsuarioRepositoryMySQL(),
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
      DNI: `123${Date.now().toString().slice(-5)}`,
      fecha_nacimiento: '1990-01-01',
    };

    const result = await registerUseCase.execute(testUser);

    expect(result.idUsuario).toBeGreaterThan(0);
  });
});
