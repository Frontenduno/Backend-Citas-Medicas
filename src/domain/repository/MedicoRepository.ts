import { Medico } from '../entity/Medico';

export interface MedicoRepository {
  save(medico: Medico): Promise<Medico>;
  findById(id: number): Promise<Medico | null>;
  findByUsuarioId(usuarioId: number): Promise<Medico | null>;
  findByEspecialidadId(especialidadId: number): Promise<Medico[]>;
  findAll(): Promise<Medico[]>;
}
