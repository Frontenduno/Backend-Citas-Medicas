import { RefrescarTokenUseCase } from '../../../../../src/application/usecase/auth/RefrescarTokenUseCase';
import { TokenInvalidoException } from '../../../../../src/application/exception/TokenInvalidoException';
import { RefreshToken } from '../../../../../src/domain/entity/RefreshToken';
import {
  crearMockUsuarioRepository,
  crearMockJwtGenerator,
  crearMockRefreshTokenRepository,
  crearMockTransactionManager,
} from '../../../helpers/mocks';
import { crearUsuarioVerificado, crearUsuarioNoVerificado } from '../../../helpers/fixtures';

describe('RefrescarTokenUseCase Unit Tests', () => {
  let refreshTokenRepo: ReturnType<typeof crearMockRefreshTokenRepository>;
  let usuarioRepo: ReturnType<typeof crearMockUsuarioRepository>;
  let jwtGenerator: ReturnType<typeof crearMockJwtGenerator>;
  let transactionManager: ReturnType<typeof crearMockTransactionManager>;
  let useCase: RefrescarTokenUseCase;

  const TOKEN_VALIDO = 'valid.refresh.token';
  const NUEVO_ACCESS_TOKEN = 'new.access.token';
  const NUEVO_REFRESH_TOKEN = 'new.refresh.token';

  beforeEach(() => {
    refreshTokenRepo = crearMockRefreshTokenRepository();
    usuarioRepo = crearMockUsuarioRepository();
    jwtGenerator = crearMockJwtGenerator();
    transactionManager = crearMockTransactionManager();
    useCase = new RefrescarTokenUseCase(
      refreshTokenRepo,
      usuarioRepo,
      jwtGenerator,
      transactionManager
    );
  });

  it('debe renovar exitosamente los tokens, revocar el anterior y persistir el nuevo', async () => {
    const tokenEntity = new RefreshToken(
      1,
      TOKEN_VALIDO,
      1,
      new Date(Date.now() + 60 * 60 * 1000), // expira en 1h
      false
    );
    const usuario = crearUsuarioVerificado({ idUsuario: 1 });

    refreshTokenRepo.findByToken.mockResolvedValue(tokenEntity);
    jwtGenerator.decodificarRefreshToken.mockResolvedValue({
      correo: usuario.correo,
      idUsuario: '1',
      rol: usuario.rol,
    });
    usuarioRepo.findById.mockResolvedValue(usuario);
    jwtGenerator.generarAccessToken.mockResolvedValue(NUEVO_ACCESS_TOKEN);
    jwtGenerator.generarRefreshToken.mockResolvedValue(NUEVO_REFRESH_TOKEN);
    refreshTokenRepo.save.mockResolvedValue({} as any);

    const resultado = await useCase.ejecutar(TOKEN_VALIDO);

    expect(resultado).toEqual({
      accessToken: NUEVO_ACCESS_TOKEN,
      refreshToken: NUEVO_REFRESH_TOKEN,
    });
    expect(refreshTokenRepo.revokeByToken).toHaveBeenCalledWith(TOKEN_VALIDO);
    expect(refreshTokenRepo.save).toHaveBeenCalled();
    expect(transactionManager.ejecutar).toHaveBeenCalledTimes(1);
  });

  it('debe lanzar TokenInvalidoException si el token no viene proporcionado', async () => {
    await expect(useCase.ejecutar('')).rejects.toThrow(TokenInvalidoException);
  });

  it('debe lanzar TokenInvalidoException si el token no existe en la BD', async () => {
    refreshTokenRepo.findByToken.mockResolvedValue(null);

    await expect(useCase.ejecutar('inexistente')).rejects.toThrow(TokenInvalidoException);
  });

  it('debe lanzar TokenInvalidoException si el token ya fue revocado', async () => {
    const tokenRevocado = new RefreshToken(
      1,
      TOKEN_VALIDO,
      1,
      new Date(Date.now() + 60 * 60 * 1000),
      true // revocado
    );
    refreshTokenRepo.findByToken.mockResolvedValue(tokenRevocado);

    await expect(useCase.ejecutar(TOKEN_VALIDO)).rejects.toThrow(TokenInvalidoException);
  });

  it('debe lanzar TokenInvalidoException si el token ya expiró', async () => {
    const tokenExpirado = new RefreshToken(
      1,
      TOKEN_VALIDO,
      1,
      new Date(Date.now() - 1000), // ya expiró
      false
    );
    refreshTokenRepo.findByToken.mockResolvedValue(tokenExpirado);

    await expect(useCase.ejecutar(TOKEN_VALIDO)).rejects.toThrow(TokenInvalidoException);
  });

  it('debe lanzar TokenInvalidoException si el usuario asociado no está verificado', async () => {
    const tokenEntity = new RefreshToken(
      1,
      TOKEN_VALIDO,
      1,
      new Date(Date.now() + 60 * 60 * 1000),
      false
    );
    const usuarioNoVerificado = crearUsuarioNoVerificado({ idUsuario: 1 });

    refreshTokenRepo.findByToken.mockResolvedValue(tokenEntity);
    jwtGenerator.decodificarRefreshToken.mockResolvedValue({
      correo: usuarioNoVerificado.correo,
      idUsuario: '1',
      rol: usuarioNoVerificado.rol,
    });
    usuarioRepo.findById.mockResolvedValue(usuarioNoVerificado);

    await expect(useCase.ejecutar(TOKEN_VALIDO)).rejects.toThrow(TokenInvalidoException);
  });
});
