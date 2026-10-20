/**
 * Filtros opcionales para listar citas de un paciente.
 */
export interface FiltrosCitaPacienteDTO {
  medicoId?: number;
  especialidadId?: number;
  fecha?: Date; // Solo la parte de fecha (YYYY-MM-DD)
}

/**
 * Read Model / Proyección plana que representa el detalle de una cita
 * con información del médico y especialidad ya resuelta.
 */
export interface DetalleCitaPacienteDTO {
  idCita: number;
  codigoTicket: string;
  nombreMedico: string; // CONCAT(nombres, ' ', apellidos)
  especialidad: string; // nombreEspecialidad
  fecha: Date;
  hora: Date;
}
