import { LoginUseCase } from '../../../src/application/usecases/Authentication/LoginUseCase';
import { MySQLUserRepository } from '../../../src/infrastructure/repositories/MySQLUserRepository';
import { BcryptHasherImpl } from '../../../src/infrastructure/service/BcryptHasherImpl';
import { JwtGeneratorImpl } from '../../../src/infrastructure/service/JwtGeneratorImpl';
import { CredencialesIncorrectasException } from '../../../src/application/exception/CredencialesIncorrectasException';
import { Usuario } from '../../../src/domain/entity/Usuario';
import { closeConnection } from '../../../src/infrastructure/database/PoolConexion';

describe('LoginUseCase (Integration)', () => {
  afterAll(async () => {
    await closeConnection();
  });

  test('debe autenticar un usuario registrado', async () => {
    const usuarioRepository = new MySQLUserRepository();
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
      new Usuario(null, hashedPassword, 'Juan', 'Perez', email, '987654321', '1990-01-01', 'Masculino', 'PACIENTE'),
    );

    const result = await loginUseCase.execute(email, contrasena);

    expect(result.token).toBeDefined();
    expect(result.usuario.correo).toBe(email);
  });
});
