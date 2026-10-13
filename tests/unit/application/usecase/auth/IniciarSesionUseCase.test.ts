import { IniciarSesionUseCase } from "../../../../../src/application/usecase/auth/IniciarSesionUseCase";
import { CredencialesIncorrectasException } from "../../../../../src/application/exception/CredencialesIncorrectasException";
import { CorreoNoVerificadoException } from "../../../../../src/application/exception/CorreoNoVerificadoException";
import {
  crearMockUsuarioRepository,
  crearMockJwtGenerator,
  crearMockPasswordHasher,
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

const TOKEN_ESPERADO = "jwt.token.firmado";

// ─── Suite ────────────────────────────────────────────────────────────────────

describe("IniciarSesionUseCase", () => {
  let usuarioRepo: ReturnType<typeof crearMockUsuarioRepository>;
  let jwtGenerator: ReturnType<typeof crearMockJwtGenerator>;
  let passwordHasher: ReturnType<typeof crearMockPasswordHasher>;
  let useCase: IniciarSesionUseCase;

  beforeEach(() => {
    usuarioRepo = crearMockUsuarioRepository();
    jwtGenerator = crearMockJwtGenerator();
    passwordHasher = crearMockPasswordHasher();
    useCase = new IniciarSesionUseCase(usuarioRepo, jwtGenerator, passwordHasher);
  });

  // ─── Casos de éxito ─────────────────────────────────────────────────────────

  describe("ejecutar (éxito)", () => {
    it("debe retornar un token JWT cuando las credenciales son válidas", async () => {
      // Arrange
      const usuario = crearUsuarioVerificado({ correo: DTO_VALIDO.correo });
      usuarioRepo.findByCorreo.mockResolvedValue(usuario);
      passwordHasher.compararContrasena.mockResolvedValue(true);
      jwtGenerator.generarToken.mockResolvedValue(TOKEN_ESPERADO);

      // Act
      const resultado = await useCase.ejecutar(DTO_VALIDO);

      // Assert
      expect(resultado).toBe(TOKEN_ESPERADO);
      expect(usuarioRepo.findByCorreo).toHaveBeenCalledWith(DTO_VALIDO.correo);
      expect(passwordHasher.compararContrasena).toHaveBeenCalledWith(
        DTO_VALIDO.contrasena,
        usuario.contrasena
      );
      expect(jwtGenerator.generarToken).toHaveBeenCalledWith({
        correo: usuario.correo,
        idUsuario: usuario.idUsuario.toString(),
        rol: usuario.rol,
      });
    });
  });

  // ─── Casos de excepción ──────────────────────────────────────────────────────

  describe("ejecutar (excepciones)", () => {
    it("debe lanzar CredencialesIncorrectasException si el usuario no existe", async () => {
      // Arrange
      usuarioRepo.findByCorreo.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.ejecutar(DTO_VALIDO)).rejects.toThrow(
        CredencialesIncorrectasException
      );
      expect(passwordHasher.compararContrasena).not.toHaveBeenCalled();
      expect(jwtGenerator.generarToken).not.toHaveBeenCalled();
    });

    it("debe lanzar CredencialesIncorrectasException si la contraseña es incorrecta", async () => {
      // Arrange
      const usuario = crearUsuarioVerificado({ correo: DTO_VALIDO.correo });
      usuarioRepo.findByCorreo.mockResolvedValue(usuario);
      passwordHasher.compararContrasena.mockResolvedValue(false);

      // Act & Assert
      await expect(useCase.ejecutar(DTO_VALIDO)).rejects.toThrow(
        CredencialesIncorrectasException
      );
      expect(jwtGenerator.generarToken).not.toHaveBeenCalled();
    });

    it("debe lanzar CorreoNoVerificadoException si el usuario no ha verificado su correo", async () => {
      // Arrange
      const usuario = crearUsuarioNoVerificado({ correo: DTO_VALIDO.correo });
      usuarioRepo.findByCorreo.mockResolvedValue(usuario);
      passwordHasher.compararContrasena.mockResolvedValue(true);

      // Act & Assert
      await expect(useCase.ejecutar(DTO_VALIDO)).rejects.toThrow(
        CorreoNoVerificadoException
      );
      expect(jwtGenerator.generarToken).not.toHaveBeenCalled();
    });
  });
});
