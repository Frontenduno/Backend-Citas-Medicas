import express from 'express';
import { createAuthController } from '../controllers/AuthController';
import { AuthControllerDependencies } from '../controllers/AuthController';

export function createAuthRoutes(authController: ReturnType<typeof createAuthController>) {
  const router = express.Router();
  router.post('/register', authController.register);
  router.post('/login', authController.login);
  return router;
}
