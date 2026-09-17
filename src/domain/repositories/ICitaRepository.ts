import { Cita } from '../entities/Cita';
import { TicketCita, EstadoTicket } from '../entities/TicketCita';
import { Horario } from '../entities/Horario';

export interface CitaWithTicket {
  cita: Cita;
  ticket: TicketCita | null;
}

export interface DisponibilidadResult {
  disponible: boolean;
  motivo?: string;
  horario?: Horario;
}

export interface ICitaRepository {
  createCita(
    pacienteId: number,
    medicoId: number,
    fecha: string,
    hora: string,
    motivo: string | null,
  ): Promise<{ cita: Cita; ticket: TicketCita }>;

  findCitaById(idCita: number): Promise<CitaWithTicket | null>;

  findCitasByPaciente(pacienteId: number): Promise<CitaWithTicket[]>;

  findCitasByMedico(medicoId: number): Promise<CitaWithTicket[]>;

  findCitasByFecha(fecha: string): Promise<CitaWithTicket[]>;

  updateEstadoCita(idTicketCita: number, estado: EstadoTicket): Promise<boolean>;

  deleteCita(idCita: number): Promise<boolean>;

  verificarDisponibilidad(
    medicoId: number,
    fecha: string,
    hora: string,
  ): Promise<DisponibilidadResult>;
}

