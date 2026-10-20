import { PacienteRepository } from '../../../domain/repository/PacienteRepository';
import { CitaPacienteQueryPort } from '../../port/CitaPacienteQueryPort';
import { DetalleCitaPacienteDTO, FiltrosCitaPacienteDTO } from '../../dto/CitaPacienteDTO';
import { PacienteNoEncontradoException } from '../../exception/PacienteNoEncontradoException';

export class ListarCitasPacienteUseCase {
  private readonly pacienteRepository: PacienteRepository;
  private readonly citaPacienteQuery: CitaPacienteQueryPort;

  constructor(
    pacienteRepository: PacienteRepository,
    citaPacienteQuery: CitaPacienteQueryPort
  ) {
    this.pacienteRepository = pacienteRepository;
    this.citaPacienteQuery = citaPacienteQuery;
  }

  async ejecutar(
    idUsuario: number,
    filtros?: FiltrosCitaPacienteDTO
  ): Promise<DetalleCitaPacienteDTO[]> {
    // 1. Resolver idPaciente desde idUsuario
    const paciente = await this.pacienteRepository.findByUsuarioId(idUsuario);
    if (!paciente) {
      throw new PacienteNoEncontradoException();
    }

    // 2. Ejecutar consulta enriquecida con filtros opcionales
    return this.citaPacienteQuery.listarCitasPaciente(
      paciente.idPaciente,
      filtros
    );
  }
}
