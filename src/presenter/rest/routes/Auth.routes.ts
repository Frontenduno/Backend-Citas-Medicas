import { Router } from 'express';
import { AuthController } from '../controller/AuthController';

export function createAuthRouter(authController: AuthController): Router {
  const router = Router();

  router.post('/registro', authController.registrarse);
  router.post('/verificar-codigo', authController.verificarCodigo);
  router.post('/login', authController.iniciarSesion);
  router.post('/reenviar-codigo', authController.reenviarCodigo);
  router.post('/solicitar-recuperacion', authController.solicitarRecuperacion);
  router.post('/recuperar-contrasena', authController.recuperarContrasena);
  router.post('/logout', authController.cerrarSesion);

  return router;
}
