"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCompositionRoot = createCompositionRoot;
const AuthController_1 = require("./src/presenter/controllers/AuthController");
const authRoutes_1 = require("./src/presenter/routes/authRoutes");
const RegisterUseCase_1 = require("./src/application/usecases/Authentication/RegisterUseCase");
const LoginUseCase_1 = require("./src/application/usecases/Authentication/LoginUseCase");
const UserRepositoryMySQL_1 = require("./src/infrastructure/repositories/UserRepositoryMySQL");
const PacienteRepositoryMySQL_1 = require("./src/infrastructure/repositories/PacienteRepositoryMySQL");
const JwtGeneratorImpl_1 = require("./src/infrastructure/service/JwtGeneratorImpl");
const BcryptHasherImpl_1 = require("./src/infrastructure/service/BcryptHasherImpl");
const TransactionManagerImpl_1 = require("./src/infrastructure/database/TransactionManagerImpl");
const CredencialesIncorrectasException_1 = require("./src/application/exception/CredencialesIncorrectasException");
const ContactoEmergenciaMySQL_1 = require("./src/infrastructure/repositories/ContactoEmergenciaMySQL");
const RegistrarContactoEmergenciaUseCase_1 = require("./src/application/usecases/Paciente/RegistrarContactoEmergenciaUseCase");
const PacienteController_1 = require("./src/presenter/controllers/PacienteController");
const paciente_routes_1 = require("./src/presenter/routes/paciente.routes");
const CorreoRegistradoException_1 = require("./src/application/exception/CorreoRegistradoException");
// Nuevos imports para Verificación, Logger, Metrics y Jobs
const CodigoVerificacionRepositoryMySQL_1 = require("./src/infrastructure/repositories/CodigoVerificacionRepositoryMySQL");
const CryptoCodeGenerator_1 = require("./src/infrastructure/service/CryptoCodeGenerator");
const EmailSenderFactory_1 = require("./src/infrastructure/service/email/EmailSenderFactory");
const WinstonLogger_1 = require("./src/infrastructure/service/logger/WinstonLogger");
const NoopMetrics_1 = require("./src/infrastructure/service/metrics/NoopMetrics");
const SolicitarCodigoUseCase_1 = require("./src/application/usecases/Verification/SolicitarCodigoUseCase");
const ConfirmarCodigoUseCase_1 = require("./src/application/usecases/Verification/ConfirmarCodigoUseCase");
const VerificationController_1 = require("./src/presenter/controllers/VerificationController");
const verificationRoutes_1 = require("./src/presenter/routes/verificationRoutes");
const PurgarVerificacionesJob_1 = require("./src/infrastructure/jobs/PurgarVerificacionesJob");
const HealthController_1 = require("./src/presenter/controllers/HealthController");
const healthRoutes_1 = require("./src/presenter/routes/healthRoutes");
const errorHandler_1 = require("./src/presenter/middleware/errorHandler");
function createCompositionRoot() {
    // Observabilidad
    const logger = new WinstonLogger_1.WinstonLogger();
    const metrics = new NoopMetrics_1.NoopMetrics();
    // Repositories
    const usuarioRepository = new UserRepositoryMySQL_1.UsuarioRepositoryMySQL();
    const pacienteRepository = new PacienteRepositoryMySQL_1.PacienteRepositoryMySQL();
    const contactoEmergenciaRepository = new ContactoEmergenciaMySQL_1.ContactoEmergenciaMySQL();
    const codigoVerificacionRepository = new CodigoVerificacionRepositoryMySQL_1.CodigoVerificacionRepositoryMySQL();
    // Ports / Services
    const jwtGenerator = new JwtGeneratorImpl_1.JwtGeneratorImpl();
    const bcryptHasher = new BcryptHasherImpl_1.BcryptHasherImpl();
    const transactionManager = new TransactionManagerImpl_1.TransactionManagerImpl();
    const codeGenerator = new CryptoCodeGenerator_1.CryptoCodeGenerator();
    const emailProvider = process.env.EMAIL_PROVIDER || 'smtp';
    const emailSender = EmailSenderFactory_1.EmailSenderFactory.crear(emailProvider, logger);
    // Use Cases
    const registerUseCase = new RegisterUseCase_1.RegisterUseCase({
        usuarioRepository,
        pacienteRepository,
        bcryptHasher,
        transactionManager,
        correoRegistradoException: new CorreoRegistradoException_1.CorreoRegistradoException(),
    });
    const loginUseCase = new LoginUseCase_1.LoginUseCase({
        usuarioRepository,
        bcryptHasher,
        jwtGenerator,
        credencialesIncorrectasException: new CredencialesIncorrectasException_1.CredencialesIncorrectasException(),
    });
    const registrarContactoEmergenciaUseCase = new RegistrarContactoEmergenciaUseCase_1.RegistrarContactoEmergenciaUseCase(contactoEmergenciaRepository, transactionManager, pacienteRepository);
    const solicitarCodigoUseCase = new SolicitarCodigoUseCase_1.SolicitarCodigoUseCase(usuarioRepository, codigoVerificacionRepository, codeGenerator, emailSender, logger, metrics);
    const confirmarCodigoUseCase = new ConfirmarCodigoUseCase_1.ConfirmarCodigoUseCase(usuarioRepository, codigoVerificacionRepository, codeGenerator, transactionManager, bcryptHasher, logger, metrics);
    // Controllers
    const authController = (0, AuthController_1.createAuthController)({ registerUseCase, loginUseCase });
    const pacienteController = (0, PacienteController_1.createPacienteController)(registrarContactoEmergenciaUseCase, jwtGenerator);
    const verificationController = (0, VerificationController_1.createVerificationController)({ solicitarCodigoUseCase, confirmarCodigoUseCase });
    const healthController = (0, HealthController_1.createHealthController)();
    // Routes
    const authRoutes = (0, authRoutes_1.createAuthRoutes)(authController);
    const pacienteRoutes = (0, paciente_routes_1.createPacienteRoutes)(pacienteController);
    const verificationRoutes = (0, verificationRoutes_1.createVerificationRoutes)(verificationController);
    const healthRoutes = (0, healthRoutes_1.createHealthRoutes)(healthController);
    // Jobs
    const purgarVerificacionesJob = new PurgarVerificacionesJob_1.PurgarVerificacionesJob(codigoVerificacionRepository, logger);
    // Middlewares
    const errorHandler = (0, errorHandler_1.createErrorHandler)(logger);
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
