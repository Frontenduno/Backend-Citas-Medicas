import { ICitaRepository } from '../../../domain/repository/ICitaRepository';
import { UpdateEstadoCitaDTO } from '../../dtos/UpdateEstadoCitaDTO';

export class UpdateEstadoCitaUseCase {
  constructor(private readonly citaRepository: ICitaRepository) {}

  async execute(dto: UpdateEstadoCitaDTO): Promise<boolean> {
    const estadosValidos = ['Pendiente', 'Confirmado', 'Cancelado'];
    if (!dto.estado || !estadosValidos.includes(dto.estado)) {
      throw new Error(`Estado inválido. Valores permitidos: ${estadosValidos.join(', ')}`);
    }

    return await this.citaRepository.updateEstadoCita(dto.idTicketCita, dto.estado);
  }
}

