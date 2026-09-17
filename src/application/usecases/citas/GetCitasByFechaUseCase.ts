import { ICitaRepository, CitaWithTicket } from '../../../domain/repositories/ICitaRepository';

export class GetCitasByFechaUseCase {
  constructor(private readonly citaRepository: ICitaRepository) {}

  async execute(fecha: string): Promise<CitaWithTicket[]> {
    return await this.citaRepository.findCitasByFecha(fecha);
  }
}

