import { ICitaRepository, CitaWithTicket } from '../../../domain/repository/ICitaRepository';

export class GetCitasByFechaUseCase {
  constructor(private readonly citaRepository: ICitaRepository) {}

  async execute(fecha: string): Promise<CitaWithTicket[]> {
    return await this.citaRepository.findCitasByFecha(fecha);
  }
}

