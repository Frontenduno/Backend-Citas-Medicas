import { ContactoEmergencia } from "../../domain/entities/ContactoEmergencia";
import { IContactoEmergenciaRepository } from "../../domain/repositories/ContactoEmergenciaRepository";
import { pool } from "../database/PoolConexion";

export class ContactoEmergenciaMySQL implements IContactoEmergenciaRepository {
  async register(
    contactoEmergencia: ContactoEmergencia,
    connection?: any,
  ): Promise<number> {
    const executor = connection || pool;
    const sql =
      "INSERT INTO `ContactoEmergencia`" +
      "(`telefono`, `correo`, `nombres`, `apellidos`, `parentesco`, `Paciente_idPaciente`)" +
      " VALUES (?, ?, ?, ?, ?, ?)";

    const [result] = await executor.execute(sql, [
      contactoEmergencia.telefono,
      contactoEmergencia.correo,
      contactoEmergencia.nombres,
      contactoEmergencia.apellidos,
      contactoEmergencia.parentesco,
      contactoEmergencia.pacienteId,
    ]);

    return result.insertId;
  }
}
