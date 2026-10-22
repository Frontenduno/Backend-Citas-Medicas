import { RegistrarseUseCase } from "../../../../../src/application/usecase/auth/RegistrarseUseCase";
import { EmailNoEnviadoException } from "../../../../../src/application/exception/EmailNoEnviadoException";
import { UsuarioYaExisteException } from "../../../../../src/application/exception/UsuarioYaExisteException";
import {
  crearMockUsuarioRepository,
  crearMockPacienteRepository,
  crearMockCodigoVerificacionRepository,
  crearMockPasswordHasher,
  crearMockEmailSender,
  crearMockCodeGenerator,
  crearMockTransactionManager,
} from "../../../helpers/mocks";
import {
  crearUsuarioNoVerificado,
  crearUsuarioVerificado,
  crearPaciente,
  crearRegistrarseDTO,
} from "../../../helpers/fixtures";
import { Usuario } from "../../../../../src/domain/entity/Usuario";
import { CodigoVerificacion } from "../../../../../src/domain/entity/CodigoVerificacion";
import { Rol } from "../../../../../src/domain/enum/Rol";

// ─── Suite ────────────────────────────────────────────────────────────────────

describe("RegistrarseUseCase", () => {
  let usuarioRepo: ReturnType<typeof crearMockUsuarioRepository>;
  let pacienteRepo: ReturnType<typeof crearMockPacienteRepository>;
  let codigoRepo: ReturnType<typeof crearMockCodigoVerificacionRepository>;
  let passwordHasher: ReturnType<typeof crearMockPasswordHasher>;
  let emailSender: ReturnType<typeof crearMockEmailSender>;
  let codeGenerator: ReturnType<typeof crearMockCodeGenerator>;
  let transactionManager: ReturnType<typeof crearMockTransactionManager>;
  let useCase: RegistrarseUseCase;

  const configurarEscenarioExitoso = (
    correo: string,
    idUsuario = 10
  ): void => {
    usuarioRepo.findByCorreo.mockResolvedValue(null);
    passwordHasher.hashearContrasena.mockResolvedValue("hashed_Password123!");
    usuarioRepo.save.mockResolvedValue(
      crearUsuarioNoVerificado({ idUsuario, correo })
    );
    pacienteRepo.save.mockResolvedValue(
      crearPaciente({ Usuario_idUsuario: idUsuario })
    );
    codigoRepo.deleteByCorreo.mockResolvedValue(undefined);
    codeGenerator.generateCode.mockReturnValue("XY9012");
    codigoRepo.save.mockResolvedValue({} as CodigoVerificacion);
    emailSender.enviarEmail.mockResolvedValue(undefined);
  };

  beforeEach(() => {
    usuarioRepo = crearMockUsuarioRepository();
    pacienteRepo = crearMockPacienteRepository();
    codigoRepo = crearMockCodigoVerificacionRepository();
    passwordHasher = crearMockPasswordHasher();
    emailSender = crearMockEmailSender();
    codeGenerator = crearMockCodeGenerator();
    transactionManager = crearMockTransactionManager();
    useCase = new RegistrarseUseCase(
      usuarioRepo,
      codigoRepo,
      passwordHasher,
      emailSender,
      codeGenerator,
      pacienteRepo,
      transactionManager
    );
  });

  // ─── Casos de éxito ─────────────────────────────────────────────────────────

  describe("ejecutar (éxito)", () => {
    it("debe registrar usuario, perfil de paciente, código y enviar el email dentro de una transacción", async () => {
      // Arrange
      const dto = crearRegistrarseDTO();
      const hashEsperado = "hashed_Password123!";
      const codigoEsperado = "XY9012";
      configurarEscenarioExitoso(dto.correo);

      // Act
      await useCase.ejecutar(dto);

      // Assert — el flujo completo se ejecuta dentro de una sola transacción
      expect(transactionManager.ejecutar).toHaveBeenCalledTimes(1);
      expect(usuarioRepo.findByCorreo).toHaveBeenCalledWith(dto.correo);
      expect(passwordHasher.hashearContrasena).toHaveBeenCalledWith(dto.contrasena);
      expect(usuarioRepo.save).toHaveBeenCalledWith(
        expect.objectContaining<Partial<Usuario>>({
          correo: dto.correo,
          contrasena: hashEsperado,
          verificado: false,
        })
      );
      expect(pacienteRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ Usuario_idUsuario: 10 })
      );
      expect(codigoRepo.deleteByCorreo).toHaveBeenCalledWith(dto.correo);
      expect(codeGenerator.generateCode).toHaveBeenCalledTimes(1);
      expect(codigoRepo.save).toHaveBeenCalledWith(
        expect.objectContaining<Partial<CodigoVerificacion>>({
          correo: dto.correo,
          codigo: codigoEsperado,
        })
      );
      expect(emailSender.enviarEmail).toHaveBeenCalledWith(
        dto.correo,
        expect.stringContaining("Verificación"),
        expect.stringContaining(codigoEsperado)
      );
    });

    it("debe crear el usuario con verificado=false por defecto", async () => {
      // Arrange
      const dto = crearRegistrarseDTO();
      configurarEscenarioExitoso(dto.correo);

      // Act
      await useCase.ejecutar(dto);

      // Assert
      const usuarioGuardado = usuarioRepo.save.mock.calls[0][0];
      expect(usuarioGuardado.verificado).toBe(false);
    });

    it("debe crear el perfil de Paciente cuando el rol es PACIENTE", async () => {
      // Arrange
      const dto = crearRegistrarseDTO({ rol: Rol.PACIENTE });
      configurarEscenarioExitoso(dto.correo, 25);

      // Act
      await useCase.ejecutar(dto);

      // Assert
      expect(pacienteRepo.save).toHaveBeenCalledTimes(1);
      expect(pacienteRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ Usuario_idUsuario: 25 })
      );
    });

    it("no debe crear perfil de Paciente para roles distintos de PACIENTE", async () => {
      // Arrange
      const dto = crearRegistrarseDTO({ rol: Rol.MEDICO });
      configurarEscenarioExitoso(dto.correo);

      // Act
      await useCase.ejecutar(dto);

      // Assert
      expect(usuarioRepo.save).toHaveBeenCalledTimes(1);
      expect(pacienteRepo.save).not.toHaveBeenCalled();
    });

    it("debe generar un código con expiración de 15 minutos", async () => {
      // Arrange
      const dto = crearRegistrarseDTO();
      configurarEscenarioExitoso(dto.correo);
      const antes = Date.now();

      // Act
      await useCase.ejecutar(dto);
      const despues = Date.now();

      // Assert
      const codigoGuardado = codigoRepo.save.mock.calls[0][0];
      const expiracion = codigoGuardado.fecha_expiracion.getTime();
      expect(expiracion).toBeGreaterThanOrEqual(antes + 15 * 60 * 1000);
      expect(expiracion).toBeLessThanOrEqual(despues + 15 * 60 * 1000);
    });
  });

  // ─── Casos de excepción ──────────────────────────────────────────────────────

  describe("ejecutar (excepciones)", () => {
    it("debe lanzar UsuarioYaExisteException si el correo ya está registrado", async () => {
      // Arrange
      const dto = crearRegistrarseDTO();
      usuarioRepo.findByCorreo.mockResolvedValue(
        crearUsuarioVerificado({ correo: dto.correo })
      );

      // Act & Assert
      await expect(useCase.ejecutar(dto)).rejects.toThrow(UsuarioYaExisteException);

      // Verificar que no continúa el flujo
      expect(transactionManager.ejecutar).not.toHaveBeenCalled();
      expect(passwordHasher.hashearContrasena).not.toHaveBeenCalled();
      expect(usuarioRepo.save).not.toHaveBeenCalled();
      expect(emailSender.enviarEmail).not.toHaveBeenCalled();
    });

    it("debe lanzar EmailNoEnviadoException si falla el envío del correo", async () => {
      // Arrange
      const dto = crearRegistrarseDTO();
      configurarEscenarioExitoso(dto.correo);
      emailSender.enviarEmail.mockRejectedValue(new Error("SMTP no disponible"));

      // Act & Assert
      await expect(useCase.ejecutar(dto)).rejects.toThrow(EmailNoEnviadoException);

      // El envío ocurre dentro de la transacción; en producción su error
      // provoca el rollback de todas las escrituras.
      expect(transactionManager.ejecutar).toHaveBeenCalledTimes(1);
      expect(emailSender.enviarEmail).toHaveBeenCalledTimes(1);
    });

    it("no debe enviar el email si falla el guardado del perfil de Paciente", async () => {
      // Arrange
      const dto = crearRegistrarseDTO({ rol: Rol.PACIENTE });
      configurarEscenarioExitoso(dto.correo);
      pacienteRepo.save.mockRejectedValue(new Error("Fallo al crear paciente"));

      // Act & Assert
      await expect(useCase.ejecutar(dto)).rejects.toThrow("Fallo al crear paciente");
      expect(codigoRepo.save).not.toHaveBeenCalled();
      expect(emailSender.enviarEmail).not.toHaveBeenCalled();
    });

    it("no debe enviar el email si falla el guardado del código", async () => {
      // Arrange
      const dto = crearRegistrarseDTO();
      configurarEscenarioExitoso(dto.correo);
      codigoRepo.save.mockRejectedValue(new Error("Fallo al crear código"));

      // Act & Assert
      await expect(useCase.ejecutar(dto)).rejects.toThrow("Fallo al crear código");
      expect(emailSender.enviarEmail).not.toHaveBeenCalled();
    });

    it("no debe abrir la transacción si falla el hasheo de la contraseña", async () => {
      // Arrange
      const dto = crearRegistrarseDTO();
      usuarioRepo.findByCorreo.mockResolvedValue(null);
      passwordHasher.hashearContrasena.mockRejectedValue(new Error("Fallo de hashing"));

      // Act & Assert
      await expect(useCase.ejecutar(dto)).rejects.toThrow("Fallo de hashing");
      expect(transactionManager.ejecutar).not.toHaveBeenCalled();
      expect(usuarioRepo.save).not.toHaveBeenCalled();
      expect(emailSender.enviarEmail).not.toHaveBeenCalled();
    });
  });
});
