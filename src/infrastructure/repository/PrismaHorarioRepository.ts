import { HorarioRepository } from '../../domain/repository/HorarioRepository';
import { Horario } from '../../domain/entity/Horario';
import { prisma } from '../database/prisma';
import { HorarioMapper } from '../mappers/HorarioMapper';

export class PrismaHorarioRepository implements HorarioRepository {
  async save(horario: Horario): Promise<Horario> {
    const data = HorarioMapper.toPrisma(horario);
    const created = await prisma.horario.create({ data });
    return HorarioMapper.toDomain(created);
  }

  async findById(id: number): Promise<Horario | null> {
    const record = await prisma.horario.findUnique({ where: { idHorario: id } });
    if (!record) return null;
    return HorarioMapper.toDomain(record);
  }

  async findByMedicoId(medicoId: number): Promise<Horario[]> {
    const records = await prisma.horario.findMany({ where: { Medico_idMedico: medicoId } });
    return records.map(HorarioMapper.toDomain);
  }
}
