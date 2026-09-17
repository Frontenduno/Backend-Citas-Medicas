import { EstadoTicket } from '../../domain/entities/TicketCita';

export interface UpdateEstadoCitaDTO {
  idTicketCita: number;
  estado: EstadoTicket;
}

