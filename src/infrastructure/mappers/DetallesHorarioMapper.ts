import { DetallesHorario as PrismaDetalles } from '@prisma/client';
import { DetallesHorario } from '../../domain/entity/DetallesHorario';
import { DiaSemana } from '../../domain/enum/DiaSemana';
import { Turno } from '../../domain/enum/Turno';

export class DetallesHorarioMapper {
  static toDomain(prismaDetalles: PrismaDetalles): DetallesHorario {
    return new DetallesHorario(
      prismaDetalles.idDetallesHorario,
      prismaDetalles.diaSemana as DiaSemana,
      prismaDetalles.turno as Turno,
      prismaDetalles.horaInicio,
      prismaDetalles.horaFin,
      prismaDetalles.Horario_idHorario
    );
  }

  static toPrisma(detalles: DetallesHorario) {
    return {
      diaSemana: detalles.diaSemana,
      turno: detalles.turno,
      horaInicio: detalles.horaInicio,
      horaFin: detalles.horaFin,
      Horario_idHorario: detalles.Horario_idHorario,
    };
  }
}
