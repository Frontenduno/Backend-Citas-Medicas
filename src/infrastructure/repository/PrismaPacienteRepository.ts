import { PacienteRepository } from '../../domain/repository/PacienteRepository';
import { Paciente } from '../../domain/entity/Paciente';
import { getPrismaClient } from '../database/prisma';
import { PacienteMapper } from '../mappers/PacienteMapper';

export class PrismaPacienteRepository implements PacienteRepository {
  async save(paciente: Paciente): Promise<Paciente> {
    const db = getPrismaClient();
    const data = PacienteMapper.toPrisma(paciente);
    const created = await db.paciente.create({ data });
    return PacienteMapper.toDomain(created);
  }

  async findById(id: number): Promise<Paciente | null> {
    const db = getPrismaClient();
    const record = await db.paciente.findUnique({ where: { idPaciente: id } });
    if (!record) return null;
    return PacienteMapper.toDomain(record);
  }

  async findByUsuarioId(usuarioId: number): Promise<Paciente | null> {
    const db = getPrismaClient();
    const record = await db.paciente.findUnique({ where: { Usuario_idUsuario: usuarioId } });
    if (!record) return null;
    return PacienteMapper.toDomain(record);
  }

  async findAll(): Promise<Paciente[]> {
    const db = getPrismaClient();
    const records = await db.paciente.findMany();
    return records.map(PacienteMapper.toDomain);
  }
}
