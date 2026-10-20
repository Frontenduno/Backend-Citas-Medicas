import { Router } from 'express';
import { PacienteController } from '../controller/PacienteController';

export function createPacienteRouter(pacienteController: PacienteController): Router {
  const router = Router();

  // GET /api/v1/paciente/citas?medicoId=X&especialidadId=Y&fecha=YYYY-MM-DD
  router.get('/citas', pacienteController.listarCitas);

  return router;
}
