import { Especialidad } from '../entity/Especialidad';

export interface EspecialidadRepository {
  save(especialidad: Especialidad): Promise<Especialidad>;
  findById(id: number): Promise<Especialidad | null>;
  findAll(): Promise<Especialidad[]>;
}
