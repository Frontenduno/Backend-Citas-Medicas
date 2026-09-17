import { ICitaRepository } from '../../../domain/repositories/ICitaRepository';

export class DeleteCitaUseCase {
  constructor(private readonly citaRepository: ICitaRepository) {}

  async execute(idCita: number): Promise<boolean> {
    return await this.citaRepository.deleteCita(idCita);
  }
}

