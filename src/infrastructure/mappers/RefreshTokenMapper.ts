import { RefreshToken as PrismaRefreshToken } from '@prisma/client';
import { RefreshToken } from '../../domain/entity/RefreshToken';

export class RefreshTokenMapper {
  static toDomain(prismaToken: PrismaRefreshToken): RefreshToken {
    return new RefreshToken(
      prismaToken.idRefreshToken,
      prismaToken.token,
      prismaToken.idUsuario,
      prismaToken.fecha_expiracion,
      prismaToken.revocado,
      prismaToken.created_at
    );
  }

  static toPrisma(domainToken: RefreshToken) {
    return {
      token: domainToken.token,
      idUsuario: domainToken.idUsuario,
      fecha_expiracion: domainToken.fecha_expiracion,
      revocado: domainToken.revocado,
    };
  }
}
