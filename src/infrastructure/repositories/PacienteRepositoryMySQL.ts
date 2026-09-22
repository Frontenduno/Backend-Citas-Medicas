import { pool } from "../database/PoolConexion";
import { Paciente } from "../../domain/entities/Paciente";
import { IPacienteRepository } from "../../domain/repositories/PacienteRepository";

export class PacienteRepositoryMySQL implements IPacienteRepository {
  async create(paciente: Paciente, connection?: any): Promise<number> {
    const executor = connection || pool;
    const sql = `INSERT INTO Paciente (Usuario_idUsuario) VALUES (?);`;
    const [result] = await executor.execute(sql, [paciente.idUsuario]);
    return result.insertId;
  }

  async findByIdUsuario(
    idUsuario: number,
    connection?: any,
  ): Promise<Paciente> {
    const executor = connection || pool;
    const sql = "SELECT * FROM Paciente WHERE Usuario_idUsuario = ?";

    const [rows] = await executor.execute(sql, [idUsuario]);

    const pacienteResult = rows[0];

    return new Paciente(pacienteResult.idPaciente, pacienteResult.idUsuario);
  }
}
