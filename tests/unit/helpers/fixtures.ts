import { Usuario } from "../../../src/domain/entity/Usuario";
import { CodigoVerificacion } from "../../../src/domain/entity/CodigoVerificacion";
import { Paciente } from "../../../src/domain/entity/Paciente";
import { Genero } from "../../../src/domain/enum/Genero";
import { Rol } from "../../../src/domain/enum/Rol";
import { DetalleCitaPacienteDTO } from "../../../src/application/dto/CitaPacienteDTO";
import { RegistrarseDTO } from "../../../src/application/dto/AuthDTO";

// ─── Fixtures de Usuario ──────────────────────────────────────────────────────

export const crearUsuarioVerificado = (overrides: Partial<Usuario> = {}): Usuario =>
  new Usuario(
    overrides.idUsuario ?? 1,
    overrides.contrasena ?? "hashed_password",
    overrides.nombres ?? "Juan",
    overrides.apellidos ?? "Pérez",
    overrides.correo ?? "juan@example.com",
    overrides.documento_identidad ?? "12345678",
    overrides.telefono ?? "987654321",
    overrides.genero ?? Genero.MASCULINO,
    overrides.fecha_nacimiento ?? new Date("1990-01-15"),
    overrides.rol ?? Rol.PACIENTE,
    overrides.verificado ?? true
  );

export const crearUsuarioNoVerificado = (overrides: Partial<Usuario> = {}): Usuario =>
  crearUsuarioVerificado({ ...overrides, verificado: false });

// ─── Fixtures de RegistrarseDTO ───────────────────────────────────────────────

export const crearRegistrarseDTO = (
  overrides: Partial<RegistrarseDTO> = {}
): RegistrarseDTO => ({
  nombres: "Ana",
  apellidos: "García",
  correo: "ana@example.com",
  contrasena: "Password123!",
  documento_identidad: "87654321",
  telefono: "912345678",
  genero: Genero.FEMENINO,
  fecha_nacimiento: new Date("1995-05-20"),
  rol: Rol.PACIENTE,
  ...overrides,
});

// ─── Fixtures de CodigoVerificacion ──────────────────────────────────────────

export const crearCodigoVigente = (overrides: Partial<CodigoVerificacion> = {}): CodigoVerificacion =>
  new CodigoVerificacion(
    overrides.idCodigoVerificacion ?? 1,
    overrides.correo ?? "juan@example.com",
    overrides.codigo ?? "ABC123",
    overrides.fecha_expiracion ?? new Date(Date.now() + 10 * 60 * 1000) // expira en 10 min
  );

export const crearCodigoExpirado = (overrides: Partial<CodigoVerificacion> = {}): CodigoVerificacion =>
  new CodigoVerificacion(
    overrides.idCodigoVerificacion ?? 1,
    overrides.correo ?? "juan@example.com",
    overrides.codigo ?? "ABC123",
    overrides.fecha_expiracion ?? new Date(Date.now() - 5 * 60 * 1000) // expiró hace 5 min
  );

// ─── Fixtures de Paciente ─────────────────────────────────────────────────────

export const crearPaciente = (overrides: Partial<Paciente> = {}): Paciente =>
  new Paciente(
    overrides.idPaciente ?? 1,
    overrides.Usuario_idUsuario ?? 1
  );

// ─── Fixtures de DetalleCitaPacienteDTO ───────────────────────────────────────

export const crearDetalleCitaPaciente = (
  overrides: Partial<DetalleCitaPacienteDTO> = {}
): DetalleCitaPacienteDTO => ({
  idCita: overrides.idCita ?? 1,
  codigoTicket: overrides.codigoTicket ?? "TK-20261020-001",
  nombreMedico: overrides.nombreMedico ?? "Juan Pérez",
  especialidad: overrides.especialidad ?? "Cardiología",
  fecha: overrides.fecha ?? new Date("2026-10-20T00:00:00.000Z"),
  hora: overrides.hora ?? new Date("1970-01-01T14:30:00.000Z"),
});
