import { EstadoTicket } from "../enum/EstadoTicket";

export class TicketCita {
  constructor(
    public readonly idTicketCita: number,
    public readonly codigoTicket: string,
    public readonly Cita_idCita: number,
    public readonly estado: EstadoTicket,
    public readonly codigoPago?: string,
    public readonly created_at: Date = new Date()
  ) { }
}