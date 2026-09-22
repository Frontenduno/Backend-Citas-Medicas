import { ICitaRepository } from '../../../domain/repositories/ICitaRepository';
import { CreateCitaDTO } from '../../dtos/CreateCitaDTO';
import { Cita } from '../../../domain/entities/Cita';
import { TicketCita } from '../../../domain/entities/TicketCita';

export class CreateCitaUseCase {
  constructor(private readonly citaRepository: ICitaRepository) {}

  async execute(dto: CreateCitaDTO): Promise<{ cita: Cita; ticket: TicketCita }> {
    if (!dto.pacienteId || !dto.medicoId || !dto.fecha || !dto.hora) {
      throw new Error('Campos requeridos: pacienteId, medicoId, fecha, hora');
    }

    const disponibilidad = await this.citaRepository.verificarDisponibilidad(
      dto.medicoId,
      dto.fecha,
      dto.hora,
    );

    if (!disponibilidad.disponible) {
      const error: any = new Error(disponibilidad.motivo || 'El médico no está disponible');
      error.statusCode = 409;
      throw error;
    }

    return await this.citaRepository.createCita(
      dto.pacienteId,
      dto.medicoId,
      dto.fecha,
      dto.hora,
      dto.motivo ?? null,
    );
  }
}

