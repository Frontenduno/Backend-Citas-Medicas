import { Router } from 'express';
import { AuthController } from '../../../presenter/rest/controller/AuthController';
import { createAuthRouter } from '../../../presenter/rest/routes/Auth.routes';
import { RegistrarseUseCase } from '../../../application/usecase/auth/RegistrarseUseCase';
import { VerificarCodigoUseCase } from '../../../application/usecase/auth/VerificarCodigoUseCase';
import { IniciarSesionUseCase } from '../../../application/usecase/auth/IniciarSesionUseCase';
import { ReenviarCodigoUseCase } from '../../../application/usecase/auth/ReenviarCodigoUseCase';
import { SolicitarRecuperacionUseCase } from '../../../application/usecase/auth/SolicitarRecuperacionUseCase';
import { RecuperarContrasenaUseCase } from '../../../application/usecase/auth/RecuperarContrasenaUseCase';

import { PrismaUsuarioRepository } from '../../repository/PrismaUsuarioRepository';
import { PrismaCodigoVerificacionRepository } from '../../repository/PrismaCodigoVerificacionRepository';
import { SharedContainer } from '../SharedContainer';

export class AuthFactory {
  static createController(): AuthController {
    // 1. Repositorios de datos
    const usuarioRepository = new PrismaUsuarioRepository();
    const codigoRepository = new PrismaCodigoVerificacionRepository();

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
      codeGenerator
    );

    const verificarCodigoUseCase = new VerificarCodigoUseCase(
      codigoRepository,
      usuarioRepository
    );

    const iniciarSesionUseCase = new IniciarSesionUseCase(
      usuarioRepository,
      jwtGenerator,
      passwordHasher
    );

    const reenviarCodigoUseCase = new ReenviarCodigoUseCase(
      usuarioRepository,
      codigoRepository,
      codeGenerator,
      emailSender
    );

    const solicitarRecuperacionUseCase = new SolicitarRecuperacionUseCase(
      usuarioRepository,
      codigoRepository,
      codeGenerator,
      emailSender
    );

    const recuperarContrasenaUseCase = new RecuperarContrasenaUseCase(
      codigoRepository,
      usuarioRepository,
      passwordHasher
    );

    // 4. Controlador ensamblado
    return new AuthController(
      registrarseUseCase,
      verificarCodigoUseCase,
      iniciarSesionUseCase,
      reenviarCodigoUseCase,
      solicitarRecuperacionUseCase,
      recuperarContrasenaUseCase
    );
  }

  static createRouter(): Router {
    return createAuthRouter(this.createController());
  }
}
