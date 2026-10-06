import { Especialidad as PrismaEspecialidad } from '@prisma/client';
import { Especialidad } from '../../domain/entity/Especialidad';

export class EspecialidadMapper {
  static toDomain(prismaEspecialidad: PrismaEspecialidad): Especialidad {
    return new Especialidad(
      prismaEspecialidad.idEspecialidad,
      prismaEspecialidad.nombreEspecialidad
    );
  }

  static toPrisma(especialidad: Especialidad) {
    return {
      nombreEspecialidad: especialidad.nombreEspecialidad,
    };
  }
}
