import { RefreshTokenRepository } from '../../../domain/repository/RefreshTokenRepository';
import { UsuarioRepository } from '../../../domain/repository/UsuarioRepository';
import { AuthTokens, JwtGenerator, Payload } from '../../port/JwtGenerator';
import { RefreshToken } from '../../../domain/entity/RefreshToken';
import { TokenInvalidoException } from '../../exception/TokenInvalidoException';

export class RefrescarTokenUseCase {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly usuarioRepository: UsuarioRepository,
    private readonly jwtGenerator: JwtGenerator
  ) {}

  async ejecutar(refreshToken: string): Promise<AuthTokens> {
    if (!refreshToken) {
      throw new TokenInvalidoException('El token de actualización es requerido');
    }

    // 1. Validar existencia y vigencia en la base de datos
    const tokenDb = await this.refreshTokenRepository.findByToken(refreshToken);
    if (!tokenDb || !tokenDb.esValido()) {
      throw new TokenInvalidoException('El token de actualización es inválido, expiró o ha sido revocado');
    }

    // 2. Decodificar la firma criptográfica del token
    let payload: Payload;
    try {
      payload = await this.jwtGenerator.decodificarRefreshToken(refreshToken);
    } catch {
      throw new TokenInvalidoException('Firma de token inválida');
    }

    // 3. Validar que el usuario asociado exista y siga habilitado
    const usuario = await this.usuarioRepository.findById(Number(payload.idUsuario));
    if (!usuario || !usuario.verificado) {
      throw new TokenInvalidoException('El usuario no existe o no se encuentra verificado');
    }

    // 4. Rotación de tokens (Token Rotation): revocar el refresh token usado
    await this.refreshTokenRepository.revokeByToken(refreshToken);

    // 5. Generar par de nuevos tokens
    const nuevoPayload: Payload = {
      correo: usuario.correo,
      idUsuario: usuario.idUsuario.toString(),
      rol: usuario.rol,
    };

    const nuevoAccessToken = await this.jwtGenerator.generarAccessToken(nuevoPayload);
    const nuevoRefreshToken = await this.jwtGenerator.generarRefreshToken(nuevoPayload);

    // 6. Persistir el nuevo refresh token en la base de datos (7 días)
    const fechaExpiracion = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const nuevoTokenEntity = new RefreshToken(
      0,
      nuevoRefreshToken,
      usuario.idUsuario,
      fechaExpiracion,
      false
    );
    await this.refreshTokenRepository.save(nuevoTokenEntity);

    return {
      accessToken: nuevoAccessToken,
      refreshToken: nuevoRefreshToken,
    };
  }
}
