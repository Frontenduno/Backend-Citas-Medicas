import { CodigoVerificacionRepository } from '../../domain/repository/CodigoVerificacionRepository';
import { CodigoVerificacion } from '../../domain/entity/CodigoVerificacion';
import { prisma } from '../database/prisma';
import { CodigoVerificacionMapper } from '../mappers/CodigoVerificacionMapper';

export class PrismaCodigoVerificacionRepository implements CodigoVerificacionRepository {
  async save(codigo: CodigoVerificacion): Promise<CodigoVerificacion> {
    const data = CodigoVerificacionMapper.toPrisma(codigo);
    const created = await prisma.codigoVerificacion.create({ data });
    return CodigoVerificacionMapper.toDomain(created);
  }

  async findByCorreoYCodigo(correo: string, codigo: string): Promise<CodigoVerificacion | null> {
    const record = await prisma.codigoVerificacion.findFirst({
      where: { correo, codigo },
      orderBy: { created_at: 'desc' },
    });
    if (!record) return null;
    return CodigoVerificacionMapper.toDomain(record);
  }

  async deleteByCorreo(correo: string): Promise<void> {
    await prisma.codigoVerificacion.deleteMany({ where: { correo } });
  }
}
