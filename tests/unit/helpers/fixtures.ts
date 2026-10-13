import { Usuario } from "../../../src/domain/entity/Usuario";
import { CodigoVerificacion } from "../../../src/domain/entity/CodigoVerificacion";
import { Genero } from "../../../src/domain/enum/Genero";
import { Rol } from "../../../src/domain/enum/Rol";

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

export const crearRegistrarseDTO = () => ({
  nombres: "Ana",
  apellidos: "García",
  correo: "ana@example.com",
  contrasena: "Password123!",
  documento_identidad: "87654321",
  telefono: "912345678",
  genero: Genero.FEMENINO,
  fecha_nacimiento: new Date("1995-05-20"),
  rol: Rol.PACIENTE,
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
