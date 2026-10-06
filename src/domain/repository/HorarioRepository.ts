import { Horario } from '../entity/Horario';

export interface HorarioRepository {
  save(horario: Horario): Promise<Horario>;
  findById(id: number): Promise<Horario | null>;
  findByMedicoId(medicoId: number): Promise<Horario[]>;
}
