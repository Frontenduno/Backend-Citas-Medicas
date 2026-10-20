import { DetalleCitaPacienteDTO, FiltrosCitaPacienteDTO } from '../dto/CitaPacienteDTO';

/**
 * Puerto de lectura para consultas de citas de paciente.
 * Sigue el patrón CQRS-lite: separamos la consulta de lectura
 * (que hace JOIN de múltiples tablas) de los repositorios CRUD de dominio.
 */
export interface CitaPacienteQueryPort {
  listarCitasPaciente(
    pacienteId: number,
    filtros?: FiltrosCitaPacienteDTO
  ): Promise<DetalleCitaPacienteDTO[]>;
}
