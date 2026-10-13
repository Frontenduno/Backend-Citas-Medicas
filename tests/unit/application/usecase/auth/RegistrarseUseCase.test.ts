import { RegistrarseUseCase } from "../../../../../src/application/usecase/auth/RegistrarseUseCase";
import { UsuarioYaExisteException } from "../../../../../src/application/exception/UsuarioYaExisteException";
import {
  crearMockUsuarioRepository,
  crearMockCodigoVerificacionRepository,
  crearMockPasswordHasher,
  crearMockEmailSender,
  crearMockCodeGenerator,
} from "../../../helpers/mocks";
import {
  crearUsuarioVerificado,
  crearRegistrarseDTO,
} from "../../../helpers/fixtures";
import { Usuario } from "../../../../../src/domain/entity/Usuario";
import { CodigoVerificacion } from "../../../../../src/domain/entity/CodigoVerificacion";

// ─── Suite ────────────────────────────────────────────────────────────────────

describe("RegistrarseUseCase", () => {
  let usuarioRepo: ReturnType<typeof crearMockUsuarioRepository>;
  let codigoRepo: ReturnType<typeof crearMockCodigoVerificacionRepository>;
  let passwordHasher: ReturnType<typeof crearMockPasswordHasher>;
  let emailSender: ReturnType<typeof crearMockEmailSender>;
  let codeGenerator: ReturnType<typeof crearMockCodeGenerator>;
  let useCase: RegistrarseUseCase;

  beforeEach(() => {
    usuarioRepo = crearMockUsuarioRepository();
    codigoRepo = crearMockCodigoVerificacionRepository();
    passwordHasher = crearMockPasswordHasher();
    emailSender = crearMockEmailSender();
    codeGenerator = crearMockCodeGenerator();
    useCase = new RegistrarseUseCase(
      usuarioRepo,
      codigoRepo,
      passwordHasher,
      emailSender,
      codeGenerator
    );
  });

  // ─── Casos de éxito ─────────────────────────────────────────────────────────

  describe("ejecutar (éxito)", () => {
    it("debe registrar el usuario, guardar el código y enviar el email de verificación", async () => {
      // Arrange
      const dto = crearRegistrarseDTO();
      const hashEsperado = "hashed_Password123!";
      const codigoEsperado = "XY9012";

      usuarioRepo.findByCorreo.mockResolvedValue(null); // no existe aún
      passwordHasher.hashearContrasena.mockResolvedValue(hashEsperado);
      usuarioRepo.save.mockResolvedValue(crearUsuarioVerificado({ correo: dto.correo }));
      codigoRepo.deleteByCorreo.mockResolvedValue(undefined);
      codeGenerator.generateCode.mockReturnValue(codigoEsperado);
      codigoRepo.save.mockResolvedValue({} as CodigoVerificacion);
      emailSender.enviarEmail.mockResolvedValue(undefined);

      // Act
      await useCase.ejecutar(dto);

      // Assert — orden de operaciones del flujo
      expect(usuarioRepo.findByCorreo).toHaveBeenCalledWith(dto.correo);
      expect(passwordHasher.hashearContrasena).toHaveBeenCalledWith(dto.contrasena);
      expect(usuarioRepo.save).toHaveBeenCalledWith(
        expect.objectContaining<Partial<Usuario>>({
          correo: dto.correo,
          contrasena: hashEsperado,
          verificado: false,
        })
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
      usuarioRepo.findByCorreo.mockResolvedValue(null);
      passwordHasher.hashearContrasena.mockResolvedValue("hash");
      usuarioRepo.save.mockResolvedValue(crearUsuarioVerificado({ correo: dto.correo }));
      codigoRepo.deleteByCorreo.mockResolvedValue(undefined);
      codeGenerator.generateCode.mockReturnValue("123456");
      codigoRepo.save.mockResolvedValue({} as CodigoVerificacion);
      emailSender.enviarEmail.mockResolvedValue(undefined);

      // Act
      await useCase.ejecutar(dto);

      // Assert
      const usuarioGuardado = usuarioRepo.save.mock.calls[0][0];
      expect(usuarioGuardado.verificado).toBe(false);
    });
  });

  // ─── Casos de excepción ──────────────────────────────────────────────────────

  describe("ejecutar (excepciones)", () => {
    it("debe lanzar UsuarioYaExisteException si el correo ya está registrado", async () => {
      // Arrange
      const dto = crearRegistrarseDTO();
      usuarioRepo.findByCorreo.mockResolvedValue(crearUsuarioVerificado({ correo: dto.correo }));

      // Act & Assert
      await expect(useCase.ejecutar(dto)).rejects.toThrow(UsuarioYaExisteException);

      // Verificar que no continúa el flujo
      expect(passwordHasher.hashearContrasena).not.toHaveBeenCalled();
      expect(usuarioRepo.save).not.toHaveBeenCalled();
      expect(emailSender.enviarEmail).not.toHaveBeenCalled();
    });
  });
});
