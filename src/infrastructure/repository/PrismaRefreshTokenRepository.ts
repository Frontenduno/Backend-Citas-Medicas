import { RefreshTokenRepository } from '../../domain/repository/RefreshTokenRepository';
import { RefreshToken } from '../../domain/entity/RefreshToken';
import { getPrismaClient } from '../database/prisma';
import { RefreshTokenMapper } from '../mappers/RefreshTokenMapper';

export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  async save(refreshToken: RefreshToken): Promise<RefreshToken> {
    const db = getPrismaClient();
    const data = RefreshTokenMapper.toPrisma(refreshToken);
    const created = await db.refreshToken.create({ data });
    return RefreshTokenMapper.toDomain(created);
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const db = getPrismaClient();
    const record = await db.refreshToken.findUnique({ where: { token } });
    if (!record) return null;
    return RefreshTokenMapper.toDomain(record);
  }

  async revokeByToken(token: string): Promise<void> {
    const db = getPrismaClient();
    await db.refreshToken.updateMany({
      where: { token },
      data: { revocado: true },
    });
  }

  async revokeAllByUsuario(idUsuario: number): Promise<void> {
    const db = getPrismaClient();
    await db.refreshToken.updateMany({
      where: { idUsuario },
      data: { revocado: true },
    });
  }

  async deleteByToken(token: string): Promise<void> {
    const db = getPrismaClient();
    await db.refreshToken.deleteMany({ where: { token } });
  }
}
