import { CodigoVerificacionRepository } from '../../domain/repository/CodigoVerificacionRepository';
import { CodigoVerificacion } from '../../domain/entity/CodigoVerificacion';
import { getPrismaClient } from '../database/prisma';
import { CodigoVerificacionMapper } from '../mappers/CodigoVerificacionMapper';

export class PrismaCodigoVerificacionRepository implements CodigoVerificacionRepository {
  async save(codigo: CodigoVerificacion): Promise<CodigoVerificacion> {
    const db = getPrismaClient();
    const data = CodigoVerificacionMapper.toPrisma(codigo);
    const created = await db.codigoVerificacion.create({ data });
    return CodigoVerificacionMapper.toDomain(created);
  }

  async findByCorreoYCodigo(correo: string, codigo: string): Promise<CodigoVerificacion | null> {
    const db = getPrismaClient();
    const record = await db.codigoVerificacion.findFirst({
      where: { correo, codigo },
      orderBy: { created_at: 'desc' },
    });
    if (!record) return null;
    return CodigoVerificacionMapper.toDomain(record);
  }

  async deleteByCorreo(correo: string): Promise<void> {
    const db = getPrismaClient();
    await db.codigoVerificacion.deleteMany({ where: { correo } });
  }
}
