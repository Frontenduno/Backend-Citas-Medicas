import { Paciente } from "../entity/Paciente";

export interface IPacienteRepository {
  create(paciente: Paciente, connection?: any): Promise<number>;

  findByIdUsuario(idUsuario: number, connection?: any): Promise<Paciente>;
}
