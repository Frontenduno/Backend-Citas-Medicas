import { DetallesHorarioRepository } from '../../domain/repository/DetallesHorarioRepository';
import { DetallesHorario } from '../../domain/entity/DetallesHorario';
import { prisma } from '../database/prisma';
import { DetallesHorarioMapper } from '../mappers/DetallesHorarioMapper';

export class PrismaDetallesHorarioRepository implements DetallesHorarioRepository {
  async save(detalles: DetallesHorario): Promise<DetallesHorario> {
    const data = DetallesHorarioMapper.toPrisma(detalles);
    const created = await prisma.detallesHorario.create({ data });
    return DetallesHorarioMapper.toDomain(created);
  }

  async findById(id: number): Promise<DetallesHorario | null> {
    const record = await prisma.detallesHorario.findUnique({ where: { idDetallesHorario: id } });
    if (!record) return null;
    return DetallesHorarioMapper.toDomain(record);
  }

  async findByHorarioId(horarioId: number): Promise<DetallesHorario[]> {
    const records = await prisma.detallesHorario.findMany({ where: { Horario_idHorario: horarioId } });
    return records.map(DetallesHorarioMapper.toDomain);
  }
}
