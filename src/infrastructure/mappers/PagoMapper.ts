import { Pago as PrismaPago } from '@prisma/client';
import { Pago } from '../../domain/entity/Pago';
import { EstadoPago } from '../../domain/enum/EstadoPago';
import { MetodoPago } from '../../domain/enum/MetodoPago';

export class PagoMapper {
  static toDomain(prismaPago: PrismaPago): Pago {
    return new Pago(
      prismaPago.idPago,
      prismaPago.metodo as MetodoPago,
      prismaPago.monto,
      prismaPago.fecha,
      prismaPago.hora,
      prismaPago.estado as EstadoPago,
      prismaPago.TicketCita_idTicketCita,
      prismaPago.banco ?? undefined
    );
  }

  static toPrisma(pago: Pago) {
    return {
      metodo: pago.metodo,
      monto: pago.monto,
      fecha: pago.fecha,
      hora: pago.hora,
      estado: pago.estado,
      TicketCita_idTicketCita: pago.TicketCita_idTicketCita,
      banco: pago.banco ?? null,
    };
  }
}
