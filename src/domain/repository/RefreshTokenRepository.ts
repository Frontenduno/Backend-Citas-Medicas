import { RefreshToken } from '../entity/RefreshToken';

export interface RefreshTokenRepository {
  save(refreshToken: RefreshToken): Promise<RefreshToken>;
  findByToken(token: string): Promise<RefreshToken | null>;
  revokeByToken(token: string): Promise<void>;
  revokeAllByUsuario(idUsuario: number): Promise<void>;
  deleteByToken(token: string): Promise<void>;
}
