import { Router } from 'express';
import { MySQLCitaRepository } from '../../infrastructure/repositories/MySQLCitaRepository';
import { CreateCitaUseCase } from '../../application/use-cases/citas/CreateCitaUseCase';
import { GetCitaByIdUseCase } from '../../application/use-cases/citas/GetCitaByIdUseCase';
import { GetCitasByPacienteUseCase } from '../../application/use-cases/citas/GetCitasByPacienteUseCase';
import { GetCitasByMedicoUseCase } from '../../application/use-cases/citas/GetCitasByMedicoUseCase';
import { GetCitasByFechaUseCase } from '../../application/use-cases/citas/GetCitasByFechaUseCase';
import { UpdateEstadoCitaUseCase } from '../../application/use-cases/citas/UpdateEstadoCitaUseCase';
import { DeleteCitaUseCase } from '../../application/use-cases/citas/DeleteCitaUseCase';
import { CheckDisponibilidadUseCase } from '../../application/use-cases/citas/CheckDisponibilidadUseCase';
import { CitaController } from '../controllers/CitaController';

export function createCitaRouter(citaRepository = new MySQLCitaRepository()): Router {
  const router = Router();

  const createCitaUseCase = new CreateCitaUseCase(citaRepository);
  const getCitaByIdUseCase = new GetCitaByIdUseCase(citaRepository);
  const getCitasByPacienteUseCase = new GetCitasByPacienteUseCase(citaRepository);
  const getCitasByMedicoUseCase = new GetCitasByMedicoUseCase(citaRepository);
  const getCitasByFechaUseCase = new GetCitasByFechaUseCase(citaRepository);
  const updateEstadoCitaUseCase = new UpdateEstadoCitaUseCase(citaRepository);
  const deleteCitaUseCase = new DeleteCitaUseCase(citaRepository);
  const checkDisponibilidadUseCase = new CheckDisponibilidadUseCase(citaRepository);

  const controller = new CitaController(
    createCitaUseCase,
    getCitaByIdUseCase,
    getCitasByPacienteUseCase,
    getCitasByMedicoUseCase,
    getCitasByFechaUseCase,
    updateEstadoCitaUseCase,
    deleteCitaUseCase,
    checkDisponibilidadUseCase,
  );

  // POST /api/citas - Agendar nueva cita
  router.post('/', controller.createCita);

  // GET /api/citas/:id - Obtener cita por ID
  router.get('/:id', controller.getCitaById);

  // GET /api/citas/paciente/:pacienteId - Citas de un paciente
  router.get('/paciente/:pacienteId', controller.getCitasByPaciente);

  // GET /api/citas/medico/:medicoId - Citas de un médico
  router.get('/medico/:medicoId', controller.getCitasByMedico);

  // GET /api/citas/fecha/:fecha - Citas por fecha
  router.get('/fecha/:fecha', controller.getCitasByFecha);

  // PUT /api/citas/:id/estado - Actualizar estado de la cita
  router.put('/:id/estado', controller.updateEstado);

  // DELETE /api/citas/:id - Eliminar cita
  router.delete('/:id', controller.deleteCita);

  // GET /api/citas/disponibilidad/:medicoId/:fecha/:hora - Verificar disponibilidad
  router.get('/disponibilidad/:medicoId/:fecha/:hora', controller.checkDisponibilidad);

  return router;
}

export default createCitaRouter();

