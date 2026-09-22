import { createAuthController } from "./src/presenter/controllers/AuthController";
import { createAuthRoutes } from "./src/presenter/routes/authRoutes";
import { RegisterUseCase } from "./src/application/usecases/Authentication/RegisterUseCase";
import { LoginUseCase } from "./src/application/usecases/Authentication/LoginUseCase";
import { UsuarioRepositoryMySQL } from "./src/infrastructure/repositories/UserRepositoryMySQL";
import { PacienteRepositoryMySQL } from "./src/infrastructure/repositories/PacienteRepositoryMySQL";
import { JwtGeneratorImpl } from "./src/infrastructure/service/JwtGeneratorImpl";
import { BcryptHasherImpl } from "./src/infrastructure/service/BcryptHasherImpl";
import { TransactionManagerImpl } from "./src/infrastructure/database/TransactionManagerImpl";
import { CredencialesIncorrectasException } from "./src/application/exception/CredencialesIncorrectasException";
import { ContactoEmergenciaMySQL } from "./src/infrastructure/repositories/ContactoEmergenciaMySQL";
import { RegistrarContactoEmergenciaUseCase } from "./src/application/usecases/Paciente/RegistrarContactoEmergenciaUseCase";
import { createPacienteController } from "./src/presenter/controllers/PacienteController";
import { createPacienteRoutes } from "./src/presenter/routes/paciente.routes";
import { CorreoRegistradoException } from "./src/application/exception/CorreoRegistradoException";

// Nuevos imports para Verificación, Logger, Metrics y Jobs
import { CodigoVerificacionRepositoryMySQL } from "./src/infrastructure/repositories/CodigoVerificacionRepositoryMySQL";
import { CryptoCodeGenerator } from "./src/infrastructure/service/CryptoCodeGenerator";
import { EmailSenderFactory } from "./src/infrastructure/service/email/EmailSenderFactory";
import { WinstonLogger } from "./src/infrastructure/service/logger/WinstonLogger";
import { NoopMetrics } from "./src/infrastructure/service/metrics/NoopMetrics";
import { SolicitarCodigoUseCase } from "./src/application/usecases/Verification/SolicitarCodigoUseCase";
import { ConfirmarCodigoUseCase } from "./src/application/usecases/Verification/ConfirmarCodigoUseCase";
import { createVerificationController } from "./src/presenter/controllers/VerificationController";
import { createVerificationRoutes } from "./src/presenter/routes/verificationRoutes";
import { PurgarVerificacionesJob } from "./src/infrastructure/jobs/PurgarVerificacionesJob";
import { createHealthController } from "./src/presenter/controllers/HealthController";
import { createHealthRoutes } from "./src/presenter/routes/healthRoutes";
import { createErrorHandler } from "./src/presenter/middleware/errorHandler";

export function createCompositionRoot() {
  // Observabilidad
  const logger = new WinstonLogger();
  const metrics = new NoopMetrics();

  // Repositories
  const usuarioRepository = new UsuarioRepositoryMySQL();
  const pacienteRepository = new PacienteRepositoryMySQL();
  const contactoEmergenciaRepository = new ContactoEmergenciaMySQL();
  const codigoVerificacionRepository = new CodigoVerificacionRepositoryMySQL();

  // Ports / Services
  const jwtGenerator = new JwtGeneratorImpl();
  const bcryptHasher = new BcryptHasherImpl();
  const transactionManager = new TransactionManagerImpl();
  const codeGenerator = new CryptoCodeGenerator();
  
  const emailProvider = process.env.EMAIL_PROVIDER || 'smtp';
  const emailSender = EmailSenderFactory.crear(emailProvider, logger);

  // Use Cases
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

  const registrarContactoEmergenciaUseCase = new RegistrarContactoEmergenciaUseCase(
    contactoEmergenciaRepository,
    transactionManager,
    pacienteRepository,
  );

  const solicitarCodigoUseCase = new SolicitarCodigoUseCase(
    usuarioRepository,
    codigoVerificacionRepository,
    codeGenerator,
    emailSender,
    logger,
    metrics
  );

  const confirmarCodigoUseCase = new ConfirmarCodigoUseCase(
    usuarioRepository,
    codigoVerificacionRepository,
    codeGenerator,
    transactionManager,
    bcryptHasher,
    logger,
    metrics
  );

  // Controllers
  const authController = createAuthController({ registerUseCase, loginUseCase });
  const pacienteController = createPacienteController(registrarContactoEmergenciaUseCase, jwtGenerator);
  const verificationController = createVerificationController({ solicitarCodigoUseCase, confirmarCodigoUseCase });
  const healthController = createHealthController();

  // Routes
  const authRoutes = createAuthRoutes(authController);
  const pacienteRoutes = createPacienteRoutes(pacienteController);
  const verificationRoutes = createVerificationRoutes(verificationController);
  const healthRoutes = createHealthRoutes(healthController);

  // Jobs
  const purgarVerificacionesJob = new PurgarVerificacionesJob(codigoVerificacionRepository, logger);

  // Middlewares
  const errorHandler = createErrorHandler(logger);

  return {
    authRoutes,
    pacienteRoutes,
    verificationRoutes,
    healthRoutes,
    purgarVerificacionesJob,
    logger,
    errorHandler
  };
}
