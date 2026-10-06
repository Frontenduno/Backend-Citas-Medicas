import { PacienteRepository } from '../../domain/repository/PacienteRepository';
import { Paciente } from '../../domain/entity/Paciente';
import { prisma } from '../database/prisma';
import { PacienteMapper } from '../mappers/PacienteMapper';

export class PrismaPacienteRepository implements PacienteRepository {
  async save(paciente: Paciente): Promise<Paciente> {
    const data = PacienteMapper.toPrisma(paciente);
    const created = await prisma.paciente.create({ data });
    return PacienteMapper.toDomain(created);
  }

  async findById(id: number): Promise<Paciente | null> {
    const record = await prisma.paciente.findUnique({ where: { idPaciente: id } });
    if (!record) return null;
    return PacienteMapper.toDomain(record);
  }

  async findByUsuarioId(usuarioId: number): Promise<Paciente | null> {
    const record = await prisma.paciente.findUnique({ where: { Usuario_idUsuario: usuarioId } });
    if (!record) return null;
    return PacienteMapper.toDomain(record);
  }

  async findAll(): Promise<Paciente[]> {
    const records = await prisma.paciente.findMany();
    return records.map(PacienteMapper.toDomain);
  }
}
