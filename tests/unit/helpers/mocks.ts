import { UsuarioRepository } from "../../../src/domain/repository/UsuarioRepository";
import { CodigoVerificacionRepository } from "../../../src/domain/repository/CodigoVerificacionRepository";
import { RefreshTokenRepository } from "../../../src/domain/repository/RefreshTokenRepository";
import { PacienteRepository } from "../../../src/domain/repository/PacienteRepository";
import { PasswordHasher } from "../../../src/application/port/PasswordHasher";
import { JwtGenerator } from "../../../src/application/port/JwtGenerator";
import { EmailSender } from "../../../src/application/port/EmailSender";
import { CodeGenerator } from "../../../src/application/port/CodeGenerator";
import { CitaPacienteQueryPort } from "../../../src/application/port/CitaPacienteQueryPort";
import { TransactionManager } from "../../../src/application/port/TransactionManager";

// ─── Mock UsuarioRepository ───────────────────────────────────────────────────

export const crearMockUsuarioRepository = (): jest.Mocked<UsuarioRepository> => ({
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findById: jest.fn(),
  findByCorreo: jest.fn(),
  findAll: jest.fn(),
  findByDocumento: jest.fn(),
});

// ─── Mock CodigoVerificacionRepository ───────────────────────────────────────

export const crearMockCodigoVerificacionRepository =
  (): jest.Mocked<CodigoVerificacionRepository> => ({
    save: jest.fn(),
    findByCorreoYCodigo: jest.fn(),
    deleteByCorreo: jest.fn(),
  });

// ─── Mock RefreshTokenRepository ──────────────────────────────────────────────

export const crearMockRefreshTokenRepository =
  (): jest.Mocked<RefreshTokenRepository> => ({
    save: jest.fn(),
    findByToken: jest.fn(),
    revokeByToken: jest.fn(),
    revokeAllByUsuario: jest.fn(),
    deleteByToken: jest.fn(),
  });

// ─── Mock PasswordHasher ──────────────────────────────────────────────────────

export const crearMockPasswordHasher = (): jest.Mocked<PasswordHasher> => ({
  hashearContrasena: jest.fn(),
  compararContrasena: jest.fn(),
});

// ─── Mock JwtGenerator ───────────────────────────────────────────────────────

export const crearMockJwtGenerator = (): jest.Mocked<JwtGenerator> => ({
  generarToken: jest.fn(),
  generarAccessToken: jest.fn(),
  generarRefreshToken: jest.fn(),
  decodificarToken: jest.fn(),
  decodificarRefreshToken: jest.fn(),
});

// ─── Mock EmailSender ─────────────────────────────────────────────────────────

export const crearMockEmailSender = (): jest.Mocked<EmailSender> => ({
  enviarEmail: jest.fn(),
});

// ─── Mock CodeGenerator ───────────────────────────────────────────────────────

export const crearMockCodeGenerator = (): jest.Mocked<CodeGenerator> => ({
  generateCode: jest.fn(),
});

// ─── Mock PacienteRepository ──────────────────────────────────────────────────

export const crearMockPacienteRepository = (): jest.Mocked<PacienteRepository> => ({
  save: jest.fn(),
  findById: jest.fn(),
  findByUsuarioId: jest.fn(),
  findAll: jest.fn(),
});

// ─── Mock CitaPacienteQueryPort ───────────────────────────────────────────────

export const crearMockCitaPacienteQueryPort =
  (): jest.Mocked<CitaPacienteQueryPort> => ({
    listarCitasPaciente: jest.fn(),
  });

// ─── Mock TransactionManager ──────────────────────────────────────────────────

export const crearMockTransactionManager = (): jest.Mocked<TransactionManager> => {
  // Por defecto ejecuta la operación recibida, simulando una transacción exitosa.
  const ejecutar = jest.fn((operacion: () => Promise<unknown>) => operacion());
  return { ejecutar } as unknown as jest.Mocked<TransactionManager>;
};
