export type EstadoTicket = 'Pendiente' | 'Confirmado' | 'Cancelado';

export class TicketCita {
  constructor(
    public readonly idTicketCita: number,
    public readonly codigoTicket: string,
    public readonly Cita_idCita: number,
    public readonly codigoPago: string | null,
    public readonly estado: EstadoTicket,
  ) {}
}

