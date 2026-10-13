import { Horario as PrismaHorario } from '@prisma/client';
import { Horario } from '../../domain/entity/Horario';

export class HorarioMapper {
  static toDomain(prismaHorario: PrismaHorario): Horario {
    return new Horario(
      prismaHorario.idHorario,
      prismaHorario.Medico_idMedico
    );
  }

  static toPrisma(horario: Horario) {
    return {
      Medico_idMedico: horario.Medico_idMedico,
    };
  }
}
