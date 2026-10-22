import { RecuperarContrasenaUseCase } from "../../../../../src/application/usecase/auth/RecuperarContrasenaUseCase";
import { CodigoInvalidoException } from "../../../../../src/application/exception/CodigoInvalidoException";
import { CodigoExpiradoException } from "../../../../../src/application/exception/CodigoExpiradoException";
import { UsuarioNoEncontradoException } from "../../../../../src/application/exception/UsuarioNoEncontradoException";
import {
  crearMockCodigoVerificacionRepository,
  crearMockUsuarioRepository,
  crearMockPasswordHasher,
  crearMockTransactionManager,
} from "../../../helpers/mocks";
import {
  crearUsuarioVerificado,
  crearCodigoVigente,
  crearCodigoExpirado,
} from "../../../helpers/fixtures";

// ─── Datos de prueba ──────────────────────────────────────────────────────────

const DTO_VALIDO = {
  correo: "juan@example.com",
  codigo: "ABC123",
  nuevaContrasena: "NuevaPassword456!",
};

// ─── Suite ────────────────────────────────────────────────────────────────────

describe("RecuperarContrasenaUseCase", () => {
  let codigoRepo: ReturnType<typeof crearMockCodigoVerificacionRepository>;
  let usuarioRepo: ReturnType<typeof crearMockUsuarioRepository>;
  let passwordHasher: ReturnType<typeof crearMockPasswordHasher>;
  let transactionManager: ReturnType<typeof crearMockTransactionManager>;
  let useCase: RecuperarContrasenaUseCase;

  beforeEach(() => {
    codigoRepo = crearMockCodigoVerificacionRepository();
    usuarioRepo = crearMockUsuarioRepository();
    passwordHasher = crearMockPasswordHasher();
    transactionManager = crearMockTransactionManager();
    useCase = new RecuperarContrasenaUseCase(
      codigoRepo,
      usuarioRepo,
      passwordHasher,
      transactionManager
    );
  });

  // ─── Casos de éxito ─────────────────────────────────────────────────────────

  describe("ejecutar (éxito)", () => {
    it("debe hashear la nueva contraseña, actualizarla y eliminar el código", async () => {
      // Arrange
      const hashNuevo = "hashed_NuevaPassword456!";
      const codigo = crearCodigoVigente({
        correo: DTO_VALIDO.correo,
        codigo: DTO_VALIDO.codigo,
      });
      const usuario = crearUsuarioVerificado({ correo: DTO_VALIDO.correo, idUsuario: 7 });

      codigoRepo.findByCorreoYCodigo.mockResolvedValue(codigo);
      usuarioRepo.findByCorreo.mockResolvedValue(usuario);
      passwordHasher.hashearContrasena.mockResolvedValue(hashNuevo);
      usuarioRepo.update.mockResolvedValue({ ...usuario, contrasena: hashNuevo });
      codigoRepo.deleteByCorreo.mockResolvedValue(undefined);

      // Act
      await useCase.ejecutar(DTO_VALIDO);

      // Assert
      expect(transactionManager.ejecutar).toHaveBeenCalledTimes(1);
      expect(codigoRepo.findByCorreoYCodigo).toHaveBeenCalledWith(
        DTO_VALIDO.correo,
        DTO_VALIDO.codigo
      );
      expect(passwordHasher.hashearContrasena).toHaveBeenCalledWith(DTO_VALIDO.nuevaContrasena);
      expect(usuarioRepo.update).toHaveBeenCalledWith(usuario.idUsuario, {
        contrasena: hashNuevo,
      });
      expect(codigoRepo.deleteByCorreo).toHaveBeenCalledWith(DTO_VALIDO.correo);
    });

    it("no debe guardar la contraseña en texto plano", async () => {
      // Arrange
      const hashNuevo = "hash_seguro_bcrypt";
      const codigo = crearCodigoVigente({ correo: DTO_VALIDO.correo });
      const usuario = crearUsuarioVerificado({ correo: DTO_VALIDO.correo });

      codigoRepo.findByCorreoYCodigo.mockResolvedValue(codigo);
      usuarioRepo.findByCorreo.mockResolvedValue(usuario);
      passwordHasher.hashearContrasena.mockResolvedValue(hashNuevo);
      usuarioRepo.update.mockResolvedValue({ ...usuario });
      codigoRepo.deleteByCorreo.mockResolvedValue(undefined);

      // Act
      await useCase.ejecutar(DTO_VALIDO);

      // Assert
      const datosActualizados = usuarioRepo.update.mock.calls[0][1];
      expect(datosActualizados.contrasena).not.toBe(DTO_VALIDO.nuevaContrasena);
      expect(datosActualizados.contrasena).toBe(hashNuevo);
    });
  });

  // ─── Casos de excepción ──────────────────────────────────────────────────────

  describe("ejecutar (excepciones)", () => {
    it("debe lanzar CodigoInvalidoException si el código no existe", async () => {
      // Arrange
      codigoRepo.findByCorreoYCodigo.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.ejecutar(DTO_VALIDO)).rejects.toThrow(CodigoInvalidoException);
      expect(passwordHasher.hashearContrasena).not.toHaveBeenCalled();
      expect(usuarioRepo.update).not.toHaveBeenCalled();
    });

    it("debe lanzar CodigoExpiradoException si el código ya expiró", async () => {
      // Arrange
      const codigoExpirado = crearCodigoExpirado({
        correo: DTO_VALIDO.correo,
        codigo: DTO_VALIDO.codigo,
      });
      codigoRepo.findByCorreoYCodigo.mockResolvedValue(codigoExpirado);

      // Act & Assert
      await expect(useCase.ejecutar(DTO_VALIDO)).rejects.toThrow(CodigoExpiradoException);
      expect(usuarioRepo.update).not.toHaveBeenCalled();
    });

    it("debe lanzar UsuarioNoEncontradoException si el usuario no existe", async () => {
      // Arrange
      const codigo = crearCodigoVigente({ correo: DTO_VALIDO.correo });
      codigoRepo.findByCorreoYCodigo.mockResolvedValue(codigo);
      usuarioRepo.findByCorreo.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.ejecutar(DTO_VALIDO)).rejects.toThrow(UsuarioNoEncontradoException);
      expect(passwordHasher.hashearContrasena).not.toHaveBeenCalled();
      expect(usuarioRepo.update).not.toHaveBeenCalled();
    });
  });
});
