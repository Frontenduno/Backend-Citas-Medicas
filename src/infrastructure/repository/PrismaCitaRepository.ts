import { CitaRepository } from '../../domain/repository/CitaRepository';
import { Cita } from '../../domain/entity/Cita';
import { prisma } from '../database/prisma';
import { CitaMapper } from '../mappers/CitaMapper';

export class PrismaCitaRepository implements CitaRepository {
  async save(cita: Cita): Promise<Cita> {
    const data = CitaMapper.toPrisma(cita);
    const created = await prisma.cita.create({ data });
    return CitaMapper.toDomain(created);
  }

  async findById(id: number): Promise<Cita | null> {
    const record = await prisma.cita.findUnique({ where: { idCita: id } });
    if (!record) return null;
    return CitaMapper.toDomain(record);
  }

  async findByPacienteId(pacienteId: number): Promise<Cita[]> {
    const records = await prisma.cita.findMany({ where: { Paciente_idPaciente: pacienteId } });
    return records.map(CitaMapper.toDomain);
  }

  async findByMedicoId(medicoId: number): Promise<Cita[]> {
    const records = await prisma.cita.findMany({ where: { Medico_idMedico: medicoId } });
    return records.map(CitaMapper.toDomain);
  }

  async findAll(): Promise<Cita[]> {
    const records = await prisma.cita.findMany();
    return records.map(CitaMapper.toDomain);
  }
}
