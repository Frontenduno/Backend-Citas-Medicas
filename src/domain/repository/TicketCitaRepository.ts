import { TicketCita } from '../entity/TicketCita';

export interface TicketCitaRepository {
  save(ticket: TicketCita): Promise<TicketCita>;
  findById(id: number): Promise<TicketCita | null>;
  findByCodigoTicket(codigo: string): Promise<TicketCita | null>;
  findByCitaId(citaId: number): Promise<TicketCita | null>;
  updateEstado(id: number, estado: string): Promise<TicketCita>;
}
