import { EstadoTicket } from '../../domain/entity/TicketCita';

export interface UpdateEstadoCitaDTO {
  idTicketCita: number;
  estado: EstadoTicket;
}

