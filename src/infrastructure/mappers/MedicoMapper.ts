import { Medico as PrismaMedico } from '@prisma/client';
import { Medico } from '../../domain/entity/Medico';

export class MedicoMapper {
  static toDomain(prismaMedico: PrismaMedico): Medico {
    return new Medico(
      prismaMedico.idMedico,
      prismaMedico.Usuario_idUsuario,
      prismaMedico.Especialidad_idEspecialidad
    );
  }

  static toPrisma(medico: Medico) {
    return {
      Usuario_idUsuario: medico.Usuario_idUsuario,
      Especialidad_idEspecialidad: medico.Especialidad_idEspecialidad,
    };
  }
}
