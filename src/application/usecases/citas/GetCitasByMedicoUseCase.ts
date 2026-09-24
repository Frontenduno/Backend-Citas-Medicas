import { ICitaRepository, CitaWithTicket } from '../../../domain/repository/ICitaRepository';

export class GetCitasByMedicoUseCase {
  constructor(private readonly citaRepository: ICitaRepository) {}

  async execute(medicoId: number): Promise<CitaWithTicket[]> {
    return await this.citaRepository.findCitasByMedico(medicoId);
  }
}

