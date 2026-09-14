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
const CorreoRegistradoException_1 = require("./src/application/exception/CorreoRegistradoException");
function createCompositionRoot() {
    const usuarioRepository = new UserRepositoryMySQL_1.UsuarioRepositoryMySQL();
    const pacienteRepository = new PacienteRepositoryMySQL_1.PacienteRepositoryMySQL();
    const jwtGenerator = new JwtGeneratorImpl_1.JwtGeneratorImpl();
    const bcryptHasher = new BcryptHasherImpl_1.BcryptHasherImpl();
    const transactionManager = new TransactionManagerImpl_1.TransactionManagerImpl();
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
    const authController = (0, AuthController_1.createAuthController)({ registerUseCase, loginUseCase });
    const authRoutes = (0, authRoutes_1.createAuthRoutes)(authController);
    return { authRoutes };
}
