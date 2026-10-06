import { Pago } from '../entity/Pago';

export interface PagoRepository {
  save(pago: Pago): Promise<Pago>;
  findById(id: number): Promise<Pago | null>;
  findByTicketCitaId(ticketCitaId: number): Promise<Pago[]>;
}
