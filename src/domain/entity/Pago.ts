import { EstadoPago } from "../enum/EstadoPago";
import { MetodoPago } from "../enum/MetodoPago";

export class Pago {
  constructor(
    public readonly idPago: number,
    public readonly metodo: MetodoPago,
    public readonly monto: number,
    public readonly fecha: Date,
    public readonly hora: Date,
    public readonly estado: EstadoPago,
    public readonly TicketCita_idTicketCita: number,
    public readonly banco?: string
  ) { }
}