import { createAuthController } from "./src/presenter/controllers/AuthController";
import { createAuthRoutes } from "./src/presenter/routes/auth.routes";
import { RegisterUseCase } from "./src/application/usecases/Authentication/RegisterUseCase";
import { LoginUseCase } from "./src/application/usecases/Authentication/LoginUseCase";
import { UsuarioRepositoryMySQL } from "./src/infrastructure/repositories/UserRepositoryMySQL";
import { PacienteRepositoryMySQL } from "./src/infrastructure/repositories/PacienteRepositoryMySQL";
import { JwtGeneratorImpl } from "./src/infrastructure/service/JwtGeneratorImpl";
import { BcryptHasherImpl } from "./src/infrastructure/service/BcryptHasherImpl";
import { TransactionManagerImpl } from "./src/infrastructure/database/TransactionManagerImpl";
import { CredencialesIncorrectasException } from "./src/application/exception/CredencialesIncorrectasException";
import { CorreoRegistradoException } from "./src/application/exception/CorreoRegistradoException";
import { ContactoEmergenciaMySQL } from "./src/infrastructure/repositories/ContactoEmergenciaMySQL";
import { RegistrarContactoEmergenciaUseCase } from "./src/application/usecases/Paciente/RegistrarContactoEmergenciaUseCase";
import { createPacienteController } from "./src/presenter/controllers/PacienteController";
import { createPacienteRoutes } from "./src/presenter/routes/paciente.routes";

export function createCompositionRoot() {
  //repositories
  const usuarioRepository = new UsuarioRepositoryMySQL();
  const pacienteRepository = new PacienteRepositoryMySQL();
  const contactoEmergenciaRepository = new ContactoEmergenciaMySQL();

  //ports
  const jwtGenerator = new JwtGeneratorImpl();
  const bcryptHasher = new BcryptHasherImpl();
  const transactionManager = new TransactionManagerImpl();

  //usecases
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

  const registrarContactoEmergenciaUseCase =
    new RegistrarContactoEmergenciaUseCase(
      contactoEmergenciaRepository,
      transactionManager,
      pacienteRepository,
    );

  //controllers
  const authController = createAuthController({
    registerUseCase,
    loginUseCase,
  });
  const pacienteController = createPacienteController(
    registrarContactoEmergenciaUseCase,
    jwtGenerator,
  );

  //routes
  const authRoutes = createAuthRoutes(authController);
  const pacienteRoutes = createPacienteRoutes(pacienteController);

  return { authRoutes, pacienteRoutes };
}
