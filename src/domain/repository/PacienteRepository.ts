import { Paciente } from '../entity/Paciente';

export interface IPacienteRepository {
  create(paciente: Paciente, connection?: any): Promise<number>;
}
