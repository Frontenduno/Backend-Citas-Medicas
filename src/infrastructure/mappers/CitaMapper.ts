import { Cita as PrismaCita } from '@prisma/client';
import { Cita } from '../../domain/entity/Cita';

export class CitaMapper {
  static toDomain(prismaCita: PrismaCita): Cita {
    return new Cita(
      prismaCita.idCita,
      prismaCita.Paciente_idPaciente,
      prismaCita.Medico_idMedico,
      prismaCita.Fecha,
      prismaCita.Hora,
      prismaCita.motivo ?? undefined
    );
  }

  static toPrisma(cita: Cita) {
    return {
      Paciente_idPaciente: cita.Paciente_idPaciente,
      Medico_idMedico: cita.Medico_idMedico,
      Fecha: cita.Fecha,
      Hora: cita.Hora,
      motivo: cita.motivo ?? null,
    };
  }
}
