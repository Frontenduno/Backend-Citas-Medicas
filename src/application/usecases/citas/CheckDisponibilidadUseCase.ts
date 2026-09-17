import { ICitaRepository, DisponibilidadResult } from '../../../domain/repositories/ICitaRepository';

export class CheckDisponibilidadUseCase {
  constructor(private readonly citaRepository: ICitaRepository) {}

  async execute(medicoId: number, fecha: string, hora: string): Promise<DisponibilidadResult> {
    return await this.citaRepository.verificarDisponibilidad(medicoId, fecha, hora);
  }
}

