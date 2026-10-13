import { TicketCita as PrismaTicketCita } from '@prisma/client';
import { TicketCita } from '../../domain/entity/TicketCita';
import { EstadoTicket } from '../../domain/enum/EstadoTicket';

export class TicketCitaMapper {
  static toDomain(prismaTicket: PrismaTicketCita): TicketCita {
    return new TicketCita(
      prismaTicket.idTicketCita,
      prismaTicket.codigoTicket,
      prismaTicket.Cita_idCita,
      prismaTicket.estado as EstadoTicket,
      prismaTicket.codigoPago ?? undefined,
      prismaTicket.created_at
    );
  }

  static toPrisma(ticket: TicketCita) {
    return {
      codigoTicket: ticket.codigoTicket,
      Cita_idCita: ticket.Cita_idCita,
      codigoPago: ticket.codigoPago ?? null,
      estado: ticket.estado,
    };
  }
}
