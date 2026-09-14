import { createAuthController } from './src/presenter/controllers/AuthController';
import { createAuthRoutes } from './src/presenter/routes/authRoutes';
import { RegisterUseCase } from './src/application/usecases/Authentication/RegisterUseCase';
import { LoginUseCase } from './src/application/usecases/Authentication/LoginUseCase';
import { UsuarioRepositoryMySQL } from './src/infrastructure/repositories/UserRepositoryMySQL';
import { PacienteRepositoryMySQL } from './src/infrastructure/repositories/PacienteRepositoryMySQL';
import { JwtGeneratorImpl } from './src/infrastructure/service/JwtGeneratorImpl';
import { BcryptHasherImpl } from './src/infrastructure/service/BcryptHasherImpl';
import { TransactionManagerImpl } from './src/infrastructure/database/TransactionManagerImpl';
import { CredencialesIncorrectasException } from './src/application/exception/CredencialesIncorrectasException';
import { CorreoRegistradoException } from './src/application/exception/CorreoRegistradoException';

export function createCompositionRoot() {
  const usuarioRepository = new UsuarioRepositoryMySQL();
  const pacienteRepository = new PacienteRepositoryMySQL();
  const jwtGenerator = new JwtGeneratorImpl();
  const bcryptHasher = new BcryptHasherImpl();
  const transactionManager = new TransactionManagerImpl();

  const registerUseCase = new RegisterUseCase({
    usuarioRepository,
    pacienteRepository,
    bcryptHasher,
    transactionManager,
    correoRegistradoException: new CorreoRegistradoException(),
  });

  const loginUseCase = new LoginUseCase({
    usuarioRepository,
    bcryptHasher,
    jwtGenerator,
    credencialesIncorrectasException: new CredencialesIncorrectasException(),
  });

  const authController = createAuthController({ registerUseCase, loginUseCase });
  const authRoutes = createAuthRoutes(authController);

  return { authRoutes };
}
