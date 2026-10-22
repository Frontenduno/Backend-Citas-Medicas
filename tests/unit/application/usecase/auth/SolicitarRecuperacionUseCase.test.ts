import { SolicitarRecuperacionUseCase } from "../../../../../src/application/usecase/auth/SolicitarRecuperacionUseCase";
import { UsuarioNoEncontradoException } from "../../../../../src/application/exception/UsuarioNoEncontradoException";
import { CorreoNoVerificadoException } from "../../../../../src/application/exception/CorreoNoVerificadoException";
import { EmailNoEnviadoException } from "../../../../../src/application/exception/EmailNoEnviadoException";
import {
  crearMockUsuarioRepository,
  crearMockCodigoVerificacionRepository,
  crearMockCodeGenerator,
  crearMockEmailSender,
  crearMockTransactionManager,
} from "../../../helpers/mocks";
import {
  crearUsuarioVerificado,
  crearUsuarioNoVerificado,
} from "../../../helpers/fixtures";
import { CodigoVerificacion } from "../../../../../src/domain/entity/CodigoVerificacion";

// ─── Datos de prueba ──────────────────────────────────────────────────────────

const DTO_VALIDO = { correo: "juan@example.com" };
const CODIGO_RECUPERACION = "RR1234";

// ─── Suite ────────────────────────────────────────────────────────────────────

describe("SolicitarRecuperacionUseCase", () => {
  let usuarioRepo: ReturnType<typeof crearMockUsuarioRepository>;
  let codigoRepo: ReturnType<typeof crearMockCodigoVerificacionRepository>;
  let codeGenerator: ReturnType<typeof crearMockCodeGenerator>;
  let emailSender: ReturnType<typeof crearMockEmailSender>;
  let transactionManager: ReturnType<typeof crearMockTransactionManager>;
  let useCase: SolicitarRecuperacionUseCase;

  beforeEach(() => {
    usuarioRepo = crearMockUsuarioRepository();
    codigoRepo = crearMockCodigoVerificacionRepository();
    codeGenerator = crearMockCodeGenerator();
    emailSender = crearMockEmailSender();
    transactionManager = crearMockTransactionManager();
    useCase = new SolicitarRecuperacionUseCase(
      usuarioRepo,
      codigoRepo,
      codeGenerator,
      emailSender,
      transactionManager
    );
  });

  // ─── Casos de éxito ─────────────────────────────────────────────────────────

  describe("ejecutar (éxito)", () => {
    it("debe generar un código de recuperación y enviarlo por email", async () => {
      // Arrange
      const usuario = crearUsuarioVerificado({ correo: DTO_VALIDO.correo });

      usuarioRepo.findByCorreo.mockResolvedValue(usuario);
      codigoRepo.deleteByCorreo.mockResolvedValue(undefined);
      codeGenerator.generateCode.mockReturnValue(CODIGO_RECUPERACION);
      codigoRepo.save.mockResolvedValue({} as CodigoVerificacion);
      emailSender.enviarEmail.mockResolvedValue(undefined);

      // Act
      await useCase.ejecutar(DTO_VALIDO);

      // Assert
      expect(transactionManager.ejecutar).toHaveBeenCalledTimes(1);
      expect(codigoRepo.deleteByCorreo).toHaveBeenCalledWith(DTO_VALIDO.correo);
      expect(codeGenerator.generateCode).toHaveBeenCalledTimes(1);
      expect(codigoRepo.save).toHaveBeenCalledWith(
        expect.objectContaining<Partial<CodigoVerificacion>>({
          correo: DTO_VALIDO.correo,
          codigo: CODIGO_RECUPERACION,
        })
      );
      expect(emailSender.enviarEmail).toHaveBeenCalledWith(
        DTO_VALIDO.correo,
        expect.stringContaining("Recuperación"),
        expect.stringContaining(CODIGO_RECUPERACION)
      );
    });

    it("debe incluir el nombre del usuario en el email de recuperación", async () => {
      // Arrange
      const usuario = crearUsuarioVerificado({ correo: DTO_VALIDO.correo, nombres: "Carlos" });

      usuarioRepo.findByCorreo.mockResolvedValue(usuario);
      codigoRepo.deleteByCorreo.mockResolvedValue(undefined);
      codeGenerator.generateCode.mockReturnValue(CODIGO_RECUPERACION);
      codigoRepo.save.mockResolvedValue({} as CodigoVerificacion);
      emailSender.enviarEmail.mockResolvedValue(undefined);

      // Act
      await useCase.ejecutar(DTO_VALIDO);

      // Assert
      const [, , cuerpo] = emailSender.enviarEmail.mock.calls[0];
      expect(cuerpo).toContain("Carlos");
    });
  });

  // ─── Casos de excepción ──────────────────────────────────────────────────────

  describe("ejecutar (excepciones)", () => {
    it("debe lanzar UsuarioNoEncontradoException si el correo no está registrado", async () => {
      // Arrange
      usuarioRepo.findByCorreo.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.ejecutar(DTO_VALIDO)).rejects.toThrow(UsuarioNoEncontradoException);
      expect(codigoRepo.deleteByCorreo).not.toHaveBeenCalled();
      expect(emailSender.enviarEmail).not.toHaveBeenCalled();
    });

    it("debe lanzar CorreoNoVerificadoException si el usuario no ha verificado su correo", async () => {
      // Arrange
      const usuario = crearUsuarioNoVerificado({ correo: DTO_VALIDO.correo });
      usuarioRepo.findByCorreo.mockResolvedValue(usuario);

      // Act & Assert
      await expect(useCase.ejecutar(DTO_VALIDO)).rejects.toThrow(CorreoNoVerificadoException);
      expect(codigoRepo.deleteByCorreo).not.toHaveBeenCalled();
      expect(emailSender.enviarEmail).not.toHaveBeenCalled();
    });

    it("debe lanzar EmailNoEnviadoException si falla el envío del correo", async () => {
      // Arrange
      const usuario = crearUsuarioVerificado({ correo: DTO_VALIDO.correo });
      usuarioRepo.findByCorreo.mockResolvedValue(usuario);
      codigoRepo.deleteByCorreo.mockResolvedValue(undefined);
      codeGenerator.generateCode.mockReturnValue(CODIGO_RECUPERACION);
      codigoRepo.save.mockResolvedValue({} as CodigoVerificacion);
      emailSender.enviarEmail.mockRejectedValue(new Error("SMTP no disponible"));

      // Act & Assert
      await expect(useCase.ejecutar(DTO_VALIDO)).rejects.toThrow(EmailNoEnviadoException);
    });
  });
});
