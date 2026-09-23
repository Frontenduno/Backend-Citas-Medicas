import { ICitaRepository, CitaWithTicket } from '../../../domain/repository/ICitaRepository';

export class GetCitasByPacienteUseCase {
  constructor(private readonly citaRepository: ICitaRepository) {}

  async execute(pacienteId: number): Promise<CitaWithTicket[]> {
    return await this.citaRepository.findCitasByPaciente(pacienteId);
  }
}

