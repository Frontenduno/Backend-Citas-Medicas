import { VerificarCodigoUseCase } from "../../../../../src/application/usecase/auth/VerificarCodigoUseCase";
import { CodigoInvalidoException } from "../../../../../src/application/exception/CodigoInvalidoException";
import { CodigoExpiradoException } from "../../../../../src/application/exception/CodigoExpiradoException";
import { UsuarioNoEncontradoException } from "../../../../../src/application/exception/UsuarioNoEncontradoException";
import {
  crearMockCodigoVerificacionRepository,
  crearMockUsuarioRepository,
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
};

// ─── Suite ────────────────────────────────────────────────────────────────────

describe("VerificarCodigoUseCase", () => {
  let codigoRepo: ReturnType<typeof crearMockCodigoVerificacionRepository>;
  let usuarioRepo: ReturnType<typeof crearMockUsuarioRepository>;
  let useCase: VerificarCodigoUseCase;

  beforeEach(() => {
    codigoRepo = crearMockCodigoVerificacionRepository();
    usuarioRepo = crearMockUsuarioRepository();
    useCase = new VerificarCodigoUseCase(codigoRepo, usuarioRepo);
  });

  // ─── Casos de éxito ─────────────────────────────────────────────────────────

  describe("ejecutar (éxito)", () => {
    it("debe marcar el usuario como verificado y eliminar el código", async () => {
      // Arrange
      const codigo = crearCodigoVigente({ correo: DTO_VALIDO.correo, codigo: DTO_VALIDO.codigo });
      const usuario = crearUsuarioVerificado({ correo: DTO_VALIDO.correo, idUsuario: 5 });

      codigoRepo.findByCorreoYCodigo.mockResolvedValue(codigo);
      usuarioRepo.findByCorreo.mockResolvedValue(usuario);
      usuarioRepo.update.mockResolvedValue({ ...usuario, verificado: true });
      codigoRepo.deleteByCorreo.mockResolvedValue(undefined);

      // Act
      await useCase.ejecutar(DTO_VALIDO);

      // Assert
      expect(codigoRepo.findByCorreoYCodigo).toHaveBeenCalledWith(
        DTO_VALIDO.correo,
        DTO_VALIDO.codigo
      );
      expect(usuarioRepo.update).toHaveBeenCalledWith(usuario.idUsuario, {
        verificado: true,
      });
      expect(codigoRepo.deleteByCorreo).toHaveBeenCalledWith(DTO_VALIDO.correo);
    });
  });

  // ─── Casos de excepción ──────────────────────────────────────────────────────

  describe("ejecutar (excepciones)", () => {
    it("debe lanzar CodigoInvalidoException si el código no existe", async () => {
      // Arrange
      codigoRepo.findByCorreoYCodigo.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.ejecutar(DTO_VALIDO)).rejects.toThrow(CodigoInvalidoException);
      expect(usuarioRepo.findByCorreo).not.toHaveBeenCalled();
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

    it("debe lanzar UsuarioNoEncontradoException si el usuario asociado no existe", async () => {
      // Arrange
      const codigo = crearCodigoVigente({ correo: DTO_VALIDO.correo });
      codigoRepo.findByCorreoYCodigo.mockResolvedValue(codigo);
      usuarioRepo.findByCorreo.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.ejecutar(DTO_VALIDO)).rejects.toThrow(UsuarioNoEncontradoException);
      expect(usuarioRepo.update).not.toHaveBeenCalled();
      expect(codigoRepo.deleteByCorreo).not.toHaveBeenCalled();
    });
  });
});
