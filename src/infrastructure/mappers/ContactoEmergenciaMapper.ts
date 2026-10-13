import { ContactoEmergencia as PrismaContacto } from '@prisma/client';
import { ContactoEmergencia } from '../../domain/entity/ContactoEmergencia';
import { Parentesco } from '../../domain/enum/Parentesco';

export class ContactoEmergenciaMapper {
  static toDomain(prismaContacto: PrismaContacto): ContactoEmergencia {
    return new ContactoEmergencia(
      prismaContacto.idContactoEmergencia,
      prismaContacto.nombres,
      prismaContacto.apellidos,
      prismaContacto.telefono,
      prismaContacto.correo,
      prismaContacto.parentesco as Parentesco,
      prismaContacto.Paciente_idPaciente ?? undefined
    );
  }

  static toPrisma(contacto: ContactoEmergencia) {
    return {
      nombres: contacto.nombres,
      apellidos: contacto.apellidos,
      telefono: contacto.telefono,
      correo: contacto.correo,
      parentesco: contacto.parentesco,
      Paciente_idPaciente: contacto.Paciente_idPaciente ?? null,
    };
  }
}
