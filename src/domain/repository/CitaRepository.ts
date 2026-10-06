import { Cita } from '../entity/Cita';

export interface CitaRepository {
  save(cita: Cita): Promise<Cita>;
  findById(id: number): Promise<Cita | null>;
  findByPacienteId(pacienteId: number): Promise<Cita[]>;
  findByMedicoId(medicoId: number): Promise<Cita[]>;
  findAll(): Promise<Cita[]>;
}
