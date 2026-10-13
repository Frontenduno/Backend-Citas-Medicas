import { RefreshTokenRepository } from '../../domain/repository/RefreshTokenRepository';
import { RefreshToken } from '../../domain/entity/RefreshToken';
import { prisma } from '../database/prisma';
import { RefreshTokenMapper } from '../mappers/RefreshTokenMapper';

export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  async save(refreshToken: RefreshToken): Promise<RefreshToken> {
    const data = RefreshTokenMapper.toPrisma(refreshToken);
    const created = await prisma.refreshToken.create({ data });
    return RefreshTokenMapper.toDomain(created);
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const record = await prisma.refreshToken.findUnique({ where: { token } });
    if (!record) return null;
    return RefreshTokenMapper.toDomain(record);
  }

  async revokeByToken(token: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { token },
      data: { revocado: true },
    });
  }

  async revokeAllByUsuario(idUsuario: number): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { idUsuario },
      data: { revocado: true },
    });
  }

  async deleteByToken(token: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { token } });
  }
}
