import { Router } from 'express';
import { AuthController } from '../controller/AuthController';
import { RegistrarseUseCase } from '../../../application/usecase/auth/RegistrarseUseCase';
import { VerificarCodigoUseCase } from '../../../application/usecase/auth/VerificarCodigoUseCase';
import { IniciarSesionUseCase } from '../../../application/usecase/auth/IniciarSesionUseCase';
import { ReenviarCodigoUseCase } from '../../../application/usecase/auth/ReenviarCodigoUseCase';
import { SolicitarRecuperacionUseCase } from '../../../application/usecase/auth/SolicitarRecuperacionUseCase';
import { RecuperarContrasenaUseCase } from '../../../application/usecase/auth/RecuperarContrasenaUseCase';

import { PrismaUsuarioRepository } from '../../../infrastructure/repository/PrismaUsuarioRepository';
import { PrismaCodigoVerificacionRepository } from '../../../infrastructure/repository/PrismaCodigoVerificacionRepository';
import { BcryptPasswordHasher } from '../../../infrastructure/service/BcryptPasswordHasher';
import { JsonWebTokenGenerator } from '../../../infrastructure/service/JsonWebTokenGenerator';
import { NodemailerEmailSender } from '../../../infrastructure/service/NodemailerEmailSender';
import { RandomCodeGenerator } from '../../../infrastructure/service/RandomCodeGenerator';

export function createAuthRouter(controller?: AuthController): Router {
  const router = Router();

  // Dependencias por defecto si no se inyecta un controlador (útil para pruebas)
  let authController = controller;
  if (!authController) {
    const usuarioRepository = new PrismaUsuarioRepository();
    const codigoRepository = new PrismaCodigoVerificacionRepository();
    const passwordHasher = new BcryptPasswordHasher();
    const jwtGenerator = new JsonWebTokenGenerator();
    const emailSender = new NodemailerEmailSender();
    const codeGenerator = new RandomCodeGenerator();

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

    authController = new AuthController(
      registrarseUseCase,
      verificarCodigoUseCase,
      iniciarSesionUseCase,
      reenviarCodigoUseCase,
      solicitarRecuperacionUseCase,
      recuperarContrasenaUseCase
    );
  }

  // Definición de endpoints REST
  router.post('/registro', authController.registrarse);
  router.post('/verificar-codigo', authController.verificarCodigo);
  router.post('/login', authController.iniciarSesion);
  router.post('/reenviar-codigo', authController.reenviarCodigo);
  router.post('/solicitar-recuperacion', authController.solicitarRecuperacion);
  router.post('/recuperar-contrasena', authController.recuperarContrasena);
  router.post('/logout', authController.cerrarSesion);

  return router;
}

const authRouter = createAuthRouter();
export default authRouter;
