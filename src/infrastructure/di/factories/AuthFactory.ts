import { Router } from 'express';
import { AuthController } from '../../../presenter/rest/controller/AuthController';
import { createAuthRouter } from '../../../presenter/rest/routes/Auth.routes';
import { RegistrarseUseCase } from '../../../application/usecase/auth/RegistrarseUseCase';
import { VerificarCodigoUseCase } from '../../../application/usecase/auth/VerificarCodigoUseCase';
import { IniciarSesionUseCase } from '../../../application/usecase/auth/IniciarSesionUseCase';
import { ReenviarCodigoUseCase } from '../../../application/usecase/auth/ReenviarCodigoUseCase';
import { SolicitarRecuperacionUseCase } from '../../../application/usecase/auth/SolicitarRecuperacionUseCase';
import { RecuperarContrasenaUseCase } from '../../../application/usecase/auth/RecuperarContrasenaUseCase';
import { RefrescarTokenUseCase } from '../../../application/usecase/auth/RefrescarTokenUseCase';

import { PrismaUsuarioRepository } from '../../repository/PrismaUsuarioRepository';
import { PrismaPacienteRepository } from '../../repository/PrismaPacienteRepository';
import { PrismaCodigoVerificacionRepository } from '../../repository/PrismaCodigoVerificacionRepository';
import { PrismaRefreshTokenRepository } from '../../repository/PrismaRefreshTokenRepository';
import { PrismaTransactionManager } from '../../database/PrismaTransactionManager';
import { SharedContainer } from '../SharedContainer';

export class AuthFactory {
  static createController(): AuthController {
    // 1. Repositorios de datos
    const usuarioRepository = new PrismaUsuarioRepository();
    const pacienteRepository = new PrismaPacienteRepository();
    const codigoRepository = new PrismaCodigoVerificacionRepository();
    const refreshTokenRepository = new PrismaRefreshTokenRepository();
    const transactionManager = new PrismaTransactionManager();

    // 2. Servicios de infraestructura compartidos
    const passwordHasher = SharedContainer.passwordHasher;
    const jwtGenerator = SharedContainer.jwtGenerator;
    const emailSender = SharedContainer.emailSender;
    const codeGenerator = SharedContainer.codeGenerator;

    // 3. Casos de uso
    const registrarseUseCase = new RegistrarseUseCase(
      usuarioRepository,
      codigoRepository,
      passwordHasher,
      emailSender,
      codeGenerator,
      pacienteRepository,
      transactionManager
    );

    const verificarCodigoUseCase = new VerificarCodigoUseCase(
      codigoRepository,
      usuarioRepository,
      transactionManager
    );

    const iniciarSesionUseCase = new IniciarSesionUseCase(
      usuarioRepository,
      jwtGenerator,
      passwordHasher,
      refreshTokenRepository
    );

    const refrescarTokenUseCase = new RefrescarTokenUseCase(
      refreshTokenRepository,
      usuarioRepository,
      jwtGenerator,
      transactionManager
    );

    const reenviarCodigoUseCase = new ReenviarCodigoUseCase(
      usuarioRepository,
      codigoRepository,
      codeGenerator,
      emailSender,
      transactionManager
    );

    const solicitarRecuperacionUseCase = new SolicitarRecuperacionUseCase(
      usuarioRepository,
      codigoRepository,
      codeGenerator,
      emailSender,
      transactionManager
    );

    const recuperarContrasenaUseCase = new RecuperarContrasenaUseCase(
      codigoRepository,
      usuarioRepository,
      passwordHasher,
      transactionManager
    );

    // 4. Controlador ensamblado
    return new AuthController(
      registrarseUseCase,
      verificarCodigoUseCase,
      iniciarSesionUseCase,
      reenviarCodigoUseCase,
      solicitarRecuperacionUseCase,
      recuperarContrasenaUseCase,
      refrescarTokenUseCase,
      refreshTokenRepository
    );
  }

  static createRouter(): Router {
    return createAuthRouter(this.createController());
  }
}
