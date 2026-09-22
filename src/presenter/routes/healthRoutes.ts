import express from 'express';
import { createHealthController } from '../controllers/HealthController';

export function createHealthRoutes(healthController: ReturnType<typeof createHealthController>) {
  const router = express.Router();
  router.get('/', healthController.check);
  return router;
}

