import { MedicoRepository } from '../../domain/repository/MedicoRepository';
import { Medico } from '../../domain/entity/Medico';
import { prisma } from '../database/prisma';
import { MedicoMapper } from '../mappers/MedicoMapper';

export class PrismaMedicoRepository implements MedicoRepository {
  async save(medico: Medico): Promise<Medico> {
    const data = MedicoMapper.toPrisma(medico);
    const created = await prisma.medico.create({ data });
    return MedicoMapper.toDomain(created);
  }

  async findById(id: number): Promise<Medico | null> {
    const record = await prisma.medico.findUnique({ where: { idMedico: id } });
    if (!record) return null;
    return MedicoMapper.toDomain(record);
  }

  async findByUsuarioId(usuarioId: number): Promise<Medico | null> {
    const record = await prisma.medico.findUnique({ where: { Usuario_idUsuario: usuarioId } });
    if (!record) return null;
    return MedicoMapper.toDomain(record);
  }

  async findByEspecialidadId(especialidadId: number): Promise<Medico[]> {
    const records = await prisma.medico.findMany({ where: { Especialidad_idEspecialidad: especialidadId } });
    return records.map(MedicoMapper.toDomain);
  }

  async findAll(): Promise<Medico[]> {
    const records = await prisma.medico.findMany();
    return records.map(MedicoMapper.toDomain);
  }
}
