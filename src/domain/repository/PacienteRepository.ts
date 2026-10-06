import { Paciente } from '../entity/Paciente';

export interface PacienteRepository {
  save(paciente: Paciente): Promise<Paciente>;
  findById(id: number): Promise<Paciente | null>;
  findByUsuarioId(usuarioId: number): Promise<Paciente | null>;
  findAll(): Promise<Paciente[]>;
}
