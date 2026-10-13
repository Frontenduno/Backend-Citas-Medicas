import { TicketCitaRepository } from '../../domain/repository/TicketCitaRepository';
import { TicketCita } from '../../domain/entity/TicketCita';
import { prisma } from '../database/prisma';
import { TicketCitaMapper } from '../mappers/TicketCitaMapper';

export class PrismaTicketCitaRepository implements TicketCitaRepository {
  async save(ticket: TicketCita): Promise<TicketCita> {
    const data = TicketCitaMapper.toPrisma(ticket);
    const created = await prisma.ticketCita.create({ data });
    return TicketCitaMapper.toDomain(created);
  }

  async findById(id: number): Promise<TicketCita | null> {
    const record = await prisma.ticketCita.findUnique({ where: { idTicketCita: id } });
    if (!record) return null;
    return TicketCitaMapper.toDomain(record);
  }

  async findByCodigoTicket(codigo: string): Promise<TicketCita | null> {
    const record = await prisma.ticketCita.findFirst({ where: { codigoTicket: codigo } });
    if (!record) return null;
    return TicketCitaMapper.toDomain(record);
  }

  async findByCitaId(citaId: number): Promise<TicketCita | null> {
    const record = await prisma.ticketCita.findFirst({ where: { Cita_idCita: citaId } });
    if (!record) return null;
    return TicketCitaMapper.toDomain(record);
  }

  async updateEstado(id: number, estado: string): Promise<TicketCita> {
    const updated = await prisma.ticketCita.update({
      where: { idTicketCita: id },
      data: { estado },
    });
    return TicketCitaMapper.toDomain(updated);
  }
}
