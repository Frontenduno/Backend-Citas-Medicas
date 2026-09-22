import express from 'express';
import { createVerificationController } from '../controllers/VerificationController';

export function createVerificationRoutes(verificationController: ReturnType<typeof createVerificationController>) {
  const router = express.Router();
  
  router.post('/solicitar', verificationController.solicitar);
  router.post('/confirmar', verificationController.confirmar);
  
  return router;
}

