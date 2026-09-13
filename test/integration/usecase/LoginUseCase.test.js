const { LoginUseCase } = require('../../../src/application/usecases/Authentication/LoginUseCase');
const { UsuarioRepositoryMySQL } = require('../../../src/infrastructure/repositories/UserRepositoryMySQL');
const { BcryptHasherImpl } = require('../../../src/infrastructure/service/BcryptHasherImpl');
const { JwtGeneratorImpl } = require('../../../src/infrastructure/service/JwtGeneratorImpl');
const { CredencialesIncorrectasException } = require('../../../src/application/exception/CredencialesIncorrectasException');
const { Usuario } = require('../../../src/domain/entity/Usuario');
const { closeConnection } = require('../../../src/infrastructure/database/PoolConexion');

describe('LoginUseCase (Integration)', () => {
  afterAll(async () => {
    await closeConnection();
  });

  test('debe autenticar un usuario registrado', async () => {
    const usuarioRepository = new UsuarioRepositoryMySQL();
    const bcryptHasher = new BcryptHasherImpl();
    const jwtGenerator = new JwtGeneratorImpl();

    const loginUseCase = new LoginUseCase({
      usuarioRepository,
      bcryptHasher,
      jwtGenerator,
      credencialesIncorrectasException: new CredencialesIncorrectasException(),
    });

    const email = `login_${Date.now()}@example.com`;
    const contrasena = 'secreta123';

    const hashedPassword = await bcryptHasher.encriptarContrasena(contrasena);
    await usuarioRepository.create(
      new Usuario(null, hashedPassword, 'Juan', 'Perez', email, '987654321', 'PACIENTE'),
    );

    const result = await loginUseCase.execute(email, contrasena);

    expect(result.token).toBeDefined();
    expect(result.usuario.correo).toBe(email);
  });
});
