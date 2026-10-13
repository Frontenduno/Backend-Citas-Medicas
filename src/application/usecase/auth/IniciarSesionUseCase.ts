import { IniciarSesionDTO } from '../../dto/AuthDTO';
import { UsuarioRepository } from '../../../domain/repository/UsuarioRepository';
import { RefreshTokenRepository } from '../../../domain/repository/RefreshTokenRepository';
import { RefreshToken } from '../../../domain/entity/RefreshToken';
import { AuthTokens, JwtGenerator, Payload } from '../../port/JwtGenerator';
import { PasswordHasher } from '../../port/PasswordHasher';
import { CredencialesIncorrectasException } from '../../exception/CredencialesIncorrectasException';
import { CorreoNoVerificadoException } from '../../exception/CorreoNoVerificadoException';

export class IniciarSesionUseCase {
  private readonly usuarioRepository: UsuarioRepository;
  private readonly jwtGenerator: JwtGenerator;
  private readonly hashGenerator: PasswordHasher;
  private readonly refreshTokenRepository?: RefreshTokenRepository;

  constructor(
    usuarioRepository: UsuarioRepository,
    jwtGenerator: JwtGenerator,
    hashGenerator: PasswordHasher,
    refreshTokenRepository?: RefreshTokenRepository
  ) {
    this.usuarioRepository = usuarioRepository;
    this.jwtGenerator = jwtGenerator;
    this.hashGenerator = hashGenerator;
    this.refreshTokenRepository = refreshTokenRepository;
  }

  async ejecutar(credenciales: IniciarSesionDTO): Promise<AuthTokens> {
    const usuario = await this.usuarioRepository.findByCorreo(credenciales.correo);
    if (!usuario) {
      throw new CredencialesIncorrectasException();
    }

    const esValido = await this.hashGenerator.compararContrasena(
      credenciales.contrasena,
      usuario.contrasena
    );
    if (!esValido) {
      throw new CredencialesIncorrectasException();
    }

    if (!usuario.verificado) {
      throw new CorreoNoVerificadoException();
    }

    const payload: Payload = {
      correo: usuario.correo,
      idUsuario: usuario.idUsuario.toString(),
      rol: usuario.rol,
    };

    const accessToken = await this.jwtGenerator.generarAccessToken(payload);
    const refreshToken = await this.jwtGenerator.generarRefreshToken(payload);

    // Persistir el refresh token si el repositorio está provisto (7 días de vigencia)
    if (this.refreshTokenRepository) {
      const fechaExpiracion = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const tokenEntity = new RefreshToken(0, refreshToken, usuario.idUsuario, fechaExpiracion, false);
      await this.refreshTokenRepository.save(tokenEntity);
    }

    return {
      accessToken,
      refreshToken,
    };
  }
}