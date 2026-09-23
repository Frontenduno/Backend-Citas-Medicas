import { ICitaRepository, CitaWithTicket } from '../../../domain/repository/ICitaRepository';

export class GetCitaByIdUseCase {
  constructor(private readonly citaRepository: ICitaRepository) {}

  async execute(idCita: number): Promise<CitaWithTicket | null> {
    return await this.citaRepository.findCitaById(idCita);
  }
}

