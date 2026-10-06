import { ContactoEmergenciaRepository } from '../../domain/repository/ContactoEmergenciaRepository';
import { ContactoEmergencia } from '../../domain/entity/ContactoEmergencia';
import { prisma } from '../database/prisma';
import { ContactoEmergenciaMapper } from '../mappers/ContactoEmergenciaMapper';

export class PrismaContactoEmergenciaRepository implements ContactoEmergenciaRepository {
  async save(contacto: ContactoEmergencia): Promise<ContactoEmergencia> {
    const data = ContactoEmergenciaMapper.toPrisma(contacto);
    const created = await prisma.contactoEmergencia.create({ data });
    return ContactoEmergenciaMapper.toDomain(created);
  }

  async findById(id: number): Promise<ContactoEmergencia | null> {
    const record = await prisma.contactoEmergencia.findUnique({ where: { idContactoEmergencia: id } });
    if (!record) return null;
    return ContactoEmergenciaMapper.toDomain(record);
  }

  async findByPacienteId(pacienteId: number): Promise<ContactoEmergencia[]> {
    const records = await prisma.contactoEmergencia.findMany({ where: { Paciente_idPaciente: pacienteId } });
    return records.map(ContactoEmergenciaMapper.toDomain);
  }
}
