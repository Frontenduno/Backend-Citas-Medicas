import { PagoRepository } from '../../domain/repository/PagoRepository';
import { Pago } from '../../domain/entity/Pago';
import { prisma } from '../database/prisma';
import { PagoMapper } from '../mappers/PagoMapper';

export class PrismaPagoRepository implements PagoRepository {
  async save(pago: Pago): Promise<Pago> {
    const data = PagoMapper.toPrisma(pago);
    const created = await prisma.pago.create({ data });
    return PagoMapper.toDomain(created);
  }

  async findById(id: number): Promise<Pago | null> {
    const record = await prisma.pago.findUnique({ where: { idPago: id } });
    if (!record) return null;
    return PagoMapper.toDomain(record);
  }

  async findByTicketCitaId(ticketCitaId: number): Promise<Pago[]> {
    const records = await prisma.pago.findMany({ where: { TicketCita_idTicketCita: ticketCitaId } });
    return records.map(PagoMapper.toDomain);
  }
}
