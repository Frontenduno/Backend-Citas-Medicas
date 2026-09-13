const { createAuthController } = require('./src/presenter/controllers/AuthController');
const { createAuthRoutes } = require('./src/presenter/routes/authRoutes');
const { RegisterUseCase } = require('./src/application/usecases/Authentication/RegisterUseCase');
const { LoginUseCase } = require('./src/application/usecases/Authentication/LoginUseCase');
const { UsuarioRepositoryMySQL } = require('./src/infrastructure/repositories/UserRepositoryMySQL');
const { PacienteRepositoryMySQL } = require('./src/infrastructure/repositories/PacienteRepositoryMySQL');
const { JwtGeneratorImpl } = require('./src/infrastructure/service/JwtGeneratorImpl');
const { BcryptHasherImpl } = require('./src/infrastructure/service/BcryptHasherImpl');
const { TransactionManagerImpl } = require('./src/infrastructure/database/TransactionManagerImpl');
const { CredencialesIncorrectasException } = require('./src/application/exception/CredencialesIncorrectasException');
const { CorreoRegistradoException } = require('./src/application/exception/CorreoRegistradoException');

function createCompositionRoot() {
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

module.exports = { createCompositionRoot };
