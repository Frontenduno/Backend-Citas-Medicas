export class Pago {
  constructor(
    public readonly idPago: number,
    public readonly metodo: string,
    public readonly monto: number,
    public readonly fecha: string,
    public readonly hora: string,
    public readonly estado: string,
    public readonly banco: string | null,
    public readonly TicketCita_idTicketCita: number,
  ) {}
}
