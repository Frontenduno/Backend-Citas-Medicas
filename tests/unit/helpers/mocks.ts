import { UsuarioRepository } from "../../../src/domain/repository/UsuarioRepository";
import { CodigoVerificacionRepository } from "../../../src/domain/repository/CodigoVerificacionRepository";
import { PasswordHasher } from "../../../src/application/port/PasswordHasher";
import { JwtGenerator } from "../../../src/application/port/JwtGenerator";
import { EmailSender } from "../../../src/application/port/EmailSender";
import { CodeGenerator } from "../../../src/application/port/CodeGenerator";

// ─── Mock UsuarioRepository ───────────────────────────────────────────────────

export const crearMockUsuarioRepository = (): jest.Mocked<UsuarioRepository> => ({
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findById: jest.fn(),
  findByCorreo: jest.fn(),
  findAll: jest.fn(),
});

// ─── Mock CodigoVerificacionRepository ───────────────────────────────────────

export const crearMockCodigoVerificacionRepository =
  (): jest.Mocked<CodigoVerificacionRepository> => ({
    save: jest.fn(),
    findByCorreoYCodigo: jest.fn(),
    deleteByCorreo: jest.fn(),
  });

// ─── Mock PasswordHasher ──────────────────────────────────────────────────────

export const crearMockPasswordHasher = (): jest.Mocked<PasswordHasher> => ({
  hashearContrasena: jest.fn(),
  compararContrasena: jest.fn(),
});

// ─── Mock JwtGenerator ───────────────────────────────────────────────────────

export const crearMockJwtGenerator = (): jest.Mocked<JwtGenerator> => ({
  generarToken: jest.fn(),
  decodificarToken: jest.fn(),
});

// ─── Mock EmailSender ─────────────────────────────────────────────────────────

export const crearMockEmailSender = (): jest.Mocked<EmailSender> => ({
  enviarEmail: jest.fn(),
});

// ─── Mock CodeGenerator ───────────────────────────────────────────────────────

export const crearMockCodeGenerator = (): jest.Mocked<CodeGenerator> => ({
  generateCode: jest.fn(),
});
