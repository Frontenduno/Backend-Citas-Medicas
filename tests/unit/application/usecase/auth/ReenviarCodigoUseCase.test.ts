import { ReenviarCodigoUseCase } from "../../../../../src/application/usecase/auth/ReenviarCodigoUseCase";
import { UsuarioNoEncontradoException } from "../../../../../src/application/exception/UsuarioNoEncontradoException";
import { UsuarioYaVerificadoException } from "../../../../../src/application/exception/UsuarioYaVerificadoException";
import {
  crearMockUsuarioRepository,
  crearMockCodigoVerificacionRepository,
  crearMockCodeGenerator,
  crearMockEmailSender,
} from "../../../helpers/mocks";
import {
  crearUsuarioVerificado,
  crearUsuarioNoVerificado,
} from "../../../helpers/fixtures";
import { CodigoVerificacion } from "../../../../../src/domain/entity/CodigoVerificacion";

// ─── Datos de prueba ──────────────────────────────────────────────────────────

const DTO_VALIDO = { correo: "juan@example.com" };
const CODIGO_GENERADO = "ZZ9999";

// ─── Suite ────────────────────────────────────────────────────────────────────

describe("ReenviarCodigoUseCase", () => {
  let usuarioRepo: ReturnType<typeof crearMockUsuarioRepository>;
  let codigoRepo: ReturnType<typeof crearMockCodigoVerificacionRepository>;
  let codeGenerator: ReturnType<typeof crearMockCodeGenerator>;
  let emailSender: ReturnType<typeof crearMockEmailSender>;
  let useCase: ReenviarCodigoUseCase;

  beforeEach(() => {
    usuarioRepo = crearMockUsuarioRepository();
    codigoRepo = crearMockCodigoVerificacionRepository();
    codeGenerator = crearMockCodeGenerator();
    emailSender = crearMockEmailSender();
    useCase = new ReenviarCodigoUseCase(
      usuarioRepo,
      codigoRepo,
      codeGenerator,
      emailSender
    );
  });

  // ─── Casos de éxito ─────────────────────────────────────────────────────────

  describe("ejecutar (éxito)", () => {
    it("debe borrar código anterior, guardar nuevo código y enviar email", async () => {
      // Arrange
      const usuario = crearUsuarioNoVerificado({ correo: DTO_VALIDO.correo });

      usuarioRepo.findByCorreo.mockResolvedValue(usuario);
      codigoRepo.deleteByCorreo.mockResolvedValue(undefined);
      codeGenerator.generateCode.mockReturnValue(CODIGO_GENERADO);
      codigoRepo.save.mockResolvedValue({} as CodigoVerificacion);
      emailSender.enviarEmail.mockResolvedValue(undefined);

      // Act
      await useCase.ejecutar(DTO_VALIDO);

      // Assert — orden del flujo
      expect(codigoRepo.deleteByCorreo).toHaveBeenCalledWith(DTO_VALIDO.correo);
      expect(codeGenerator.generateCode).toHaveBeenCalledTimes(1);
      expect(codigoRepo.save).toHaveBeenCalledWith(
        expect.objectContaining<Partial<CodigoVerificacion>>({
          correo: DTO_VALIDO.correo,
          codigo: CODIGO_GENERADO,
        })
      );
      expect(emailSender.enviarEmail).toHaveBeenCalledWith(
        DTO_VALIDO.correo,
        expect.stringContaining("Verificación"),
        expect.stringContaining(CODIGO_GENERADO)
      );
    });

    it("debe incluir el nombre del usuario en el cuerpo del email", async () => {
      // Arrange
      const usuario = crearUsuarioNoVerificado({
        correo: DTO_VALIDO.correo,
        nombres: "María",
      });

      usuarioRepo.findByCorreo.mockResolvedValue(usuario);
      codigoRepo.deleteByCorreo.mockResolvedValue(undefined);
      codeGenerator.generateCode.mockReturnValue(CODIGO_GENERADO);
      codigoRepo.save.mockResolvedValue({} as CodigoVerificacion);
      emailSender.enviarEmail.mockResolvedValue(undefined);

      // Act
      await useCase.ejecutar(DTO_VALIDO);

      // Assert
      const [, , cuerpo] = emailSender.enviarEmail.mock.calls[0];
      expect(cuerpo).toContain("María");
    });
  });

  // ─── Casos de excepción ──────────────────────────────────────────────────────

  describe("ejecutar (excepciones)", () => {
    it("debe lanzar UsuarioNoEncontradoException si el correo no existe", async () => {
      // Arrange
      usuarioRepo.findByCorreo.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.ejecutar(DTO_VALIDO)).rejects.toThrow(UsuarioNoEncontradoException);
      expect(codigoRepo.deleteByCorreo).not.toHaveBeenCalled();
      expect(emailSender.enviarEmail).not.toHaveBeenCalled();
    });

    it("debe lanzar UsuarioYaVerificadoException si el usuario ya está verificado", async () => {
      // Arrange
      const usuario = crearUsuarioVerificado({ correo: DTO_VALIDO.correo });
      usuarioRepo.findByCorreo.mockResolvedValue(usuario);

      // Act & Assert
      await expect(useCase.ejecutar(DTO_VALIDO)).rejects.toThrow(UsuarioYaVerificadoException);
      expect(codigoRepo.deleteByCorreo).not.toHaveBeenCalled();
      expect(emailSender.enviarEmail).not.toHaveBeenCalled();
    });
  });
});
