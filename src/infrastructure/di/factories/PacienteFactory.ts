import { Router } from 'express';
import { PacienteController } from '../../../presenter/rest/controller/PacienteController';
import { createPacienteRouter } from '../../../presenter/rest/routes/Paciente.routes';
import { ListarCitasPacienteUseCase } from '../../../application/usecase/paciente/ListarCitasPacienteUseCase';
import { PrismaPacienteRepository } from '../../repository/PrismaPacienteRepository';
import { PrismaCitaPacienteQuery } from '../../query/PrismaCitaPacienteQuery';

export class PacienteFactory {
  static createController(): PacienteController {
    // 1. Repositorios / Query Services
    const pacienteRepository = new PrismaPacienteRepository();
    const citaPacienteQuery = new PrismaCitaPacienteQuery();

    // 2. Casos de uso
    const listarCitasUseCase = new ListarCitasPacienteUseCase(
      pacienteRepository,
      citaPacienteQuery
    );

    // 3. Controlador ensamblado
    return new PacienteController(listarCitasUseCase);
  }

  static createRouter(): Router {
    return createPacienteRouter(this.createController());
  }
}
