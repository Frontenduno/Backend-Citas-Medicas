import { Paciente as PrismaPaciente } from '@prisma/client';
import { Paciente } from '../../domain/entity/Paciente';

export class PacienteMapper {
  static toDomain(prismaPaciente: PrismaPaciente): Paciente {
    return new Paciente(
      prismaPaciente.idPaciente,
      prismaPaciente.Usuario_idUsuario
    );
  }

  static toPrisma(paciente: Paciente) {
    return {
      Usuario_idUsuario: paciente.Usuario_idUsuario,
    };
  }
}
