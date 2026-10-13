import { IniciarSesionUseCase } from "../../../../../src/application/usecase/auth/IniciarSesionUseCase";
import { CredencialesIncorrectasException } from "../../../../../src/application/exception/CredencialesIncorrectasException";
import { CorreoNoVerificadoException } from "../../../../../src/application/exception/CorreoNoVerificadoException";
import {
  crearMockUsuarioRepository,
  crearMockJwtGenerator,
  crearMockPasswordHasher,
  crearMockRefreshTokenRepository,
} from "../../../helpers/mocks";
import {
  crearUsuarioVerificado,
  crearUsuarioNoVerificado,
} from "../../../helpers/fixtures";

// ─── Datos de prueba ──────────────────────────────────────────────────────────

const DTO_VALIDO = {
  correo: "juan@example.com",
  contrasena: "Password123!",
};

const ACCESS_TOKEN_ESPERADO = "jwt.access.token";
const REFRESH_TOKEN_ESPERADO = "jwt.refresh.token";

// ─── Suite ────────────────────────────────────────────────────────────────────

describe("IniciarSesionUseCase", () => {
  let usuarioRepo: ReturnType<typeof crearMockUsuarioRepository>;
  let jwtGenerator: ReturnType<typeof crearMockJwtGenerator>;
  let passwordHasher: ReturnType<typeof crearMockPasswordHasher>;
  let refreshTokenRepo: ReturnType<typeof crearMockRefreshTokenRepository>;
  let useCase: IniciarSesionUseCase;

  beforeEach(() => {
    usuarioRepo = crearMockUsuarioRepository();
    jwtGenerator = crearMockJwtGenerator();
    passwordHasher = crearMockPasswordHasher();
    refreshTokenRepo = crearMockRefreshTokenRepository();
    useCase = new IniciarSesionUseCase(
      usuarioRepo,
      jwtGenerator,
      passwordHasher,
      refreshTokenRepo
    );
  });

  // ─── Casos de éxito ─────────────────────────────────────────────────────────

  describe("ejecutar (éxito)", () => {
    it("debe retornar los tokens de acceso y refresh y persistir el refresh token cuando las credenciales son válidas", async () => {
      // Arrange
      const usuario = crearUsuarioVerificado({ correo: DTO_VALIDO.correo });
      usuarioRepo.findByCorreo.mockResolvedValue(usuario);
      passwordHasher.compararContrasena.mockResolvedValue(true);
      jwtGenerator.generarAccessToken.mockResolvedValue(ACCESS_TOKEN_ESPERADO);
      jwtGenerator.generarRefreshToken.mockResolvedValue(REFRESH_TOKEN_ESPERADO);
      refreshTokenRepo.save.mockResolvedValue({} as any);

      // Act
      const resultado = await useCase.ejecutar(DTO_VALIDO);

      // Assert
      expect(resultado).toEqual({
        accessToken: ACCESS_TOKEN_ESPERADO,
        refreshToken: REFRESH_TOKEN_ESPERADO,
      });
      expect(usuarioRepo.findByCorreo).toHaveBeenCalledWith(DTO_VALIDO.correo);
      expect(passwordHasher.compararContrasena).toHaveBeenCalledWith(
        DTO_VALIDO.contrasena,
        usuario.contrasena
      );
      expect(jwtGenerator.generarAccessToken).toHaveBeenCalledWith({
        correo: usuario.correo,
        idUsuario: usuario.idUsuario.toString(),
        rol: usuario.rol,
      });
      expect(jwtGenerator.generarRefreshToken).toHaveBeenCalledWith({
        correo: usuario.correo,
        idUsuario: usuario.idUsuario.toString(),
        rol: usuario.rol,
      });
      expect(refreshTokenRepo.save).toHaveBeenCalled();
    });
  });

  // ─── Casos de excepción ─────────────────────────────────────────────────────

  describe("ejecutar (excepciones)", () => {
    it("debe lanzar CredencialesIncorrectasException si el usuario no existe", async () => {
      usuarioRepo.findByCorreo.mockResolvedValue(null);

      await expect(useCase.ejecutar(DTO_VALIDO)).rejects.toThrow(
        CredencialesIncorrectasException
      );
      expect(passwordHasher.compararContrasena).not.toHaveBeenCalled();
      expect(jwtGenerator.generarAccessToken).not.toHaveBeenCalled();
    });

    it("debe lanzar CredencialesIncorrectasException si la contraseña no coincide", async () => {
      const usuario = crearUsuarioVerificado();
      usuarioRepo.findByCorreo.mockResolvedValue(usuario);
      passwordHasher.compararContrasena.mockResolvedValue(false);

      await expect(useCase.ejecutar(DTO_VALIDO)).rejects.toThrow(
        CredencialesIncorrectasException
      );
      expect(jwtGenerator.generarAccessToken).not.toHaveBeenCalled();
    });

    it("debe lanzar CorreoNoVerificadoException si el usuario no ha verificado su cuenta", async () => {
      const usuario = crearUsuarioNoVerificado();
      usuarioRepo.findByCorreo.mockResolvedValue(usuario);
      passwordHasher.compararContrasena.mockResolvedValue(true);

      await expect(useCase.ejecutar(DTO_VALIDO)).rejects.toThrow(
        CorreoNoVerificadoException
      );
      expect(jwtGenerator.generarAccessToken).not.toHaveBeenCalled();
    });
  });
});
