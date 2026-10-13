import { EspecialidadRepository } from '../../domain/repository/EspecialidadRepository';
import { Especialidad } from '../../domain/entity/Especialidad';
import { prisma } from '../database/prisma';
import { EspecialidadMapper } from '../mappers/EspecialidadMapper';

export class PrismaEspecialidadRepository implements EspecialidadRepository {
  async save(especialidad: Especialidad): Promise<Especialidad> {
    const data = EspecialidadMapper.toPrisma(especialidad);
    const created = await prisma.especialidad.create({ data });
    return EspecialidadMapper.toDomain(created);
  }

  async findById(id: number): Promise<Especialidad | null> {
    const record = await prisma.especialidad.findUnique({ where: { idEspecialidad: id } });
    if (!record) return null;
    return EspecialidadMapper.toDomain(record);
  }

  async findAll(): Promise<Especialidad[]> {
    const records = await prisma.especialidad.findMany();
    return records.map(EspecialidadMapper.toDomain);
  }
}
