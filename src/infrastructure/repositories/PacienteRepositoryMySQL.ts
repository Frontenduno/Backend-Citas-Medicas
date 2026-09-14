import { pool } from '../database/PoolConexion';
import { Paciente } from '../../domain/entity/Paciente';
import { IPacienteRepository } from '../../domain/repository/PacienteRepository';

export class PacienteRepositoryMySQL implements IPacienteRepository {
  async create(paciente: Paciente, connection?: any): Promise<number> {
    const executor = connection || pool;
    const sql = `INSERT INTO Paciente (Usuario_idUsuario) VALUES (?);`;
    const [result] = await executor.execute(sql, [
      paciente.idUsuario,
    ]);
    return result.insertId;
  }
}
