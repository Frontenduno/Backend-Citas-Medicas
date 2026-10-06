import { DetallesHorario } from '../entity/DetallesHorario';

export interface DetallesHorarioRepository {
  save(detalles: DetallesHorario): Promise<DetallesHorario>;
  findById(id: number): Promise<DetallesHorario | null>;
  findByHorarioId(horarioId: number): Promise<DetallesHorario[]>;
}
