import { pool } from "../database/PoolConexion";
import { CodigoVerificacion } from "../../domain/entity/CodigoVerificacion";
import { ICodigoVerificacionRepository } from "../../domain/repository/ICodigoVerificacionRepository";

export class MySQLCodigoVerificacionRepository implements ICodigoVerificacionRepository {
  async create(codigoVerificacion: CodigoVerificacion, connection?: any): Promise<number> {
    const executor = connection || pool;
    const [result] = await executor.execute(
      `INSERT INTO CodigoVerificacion (correo, codigo, fecha_expiracion) VALUES (?, ?, ?)`,
      [
        codigoVerificacion.correo,
        codigoVerificacion.codigo,
        codigoVerificacion.fecha_expiracion,
      ],
    );
    return result.insertId;
  }

  async findByCorreo(correo: string, connection?: any): Promise<CodigoVerificacion | null> {
    const executor = connection || pool;
    const [rows] = await executor.execute(
      `SELECT * FROM CodigoVerificacion WHERE correo = ? ORDER BY created_at DESC LIMIT 1`,
      [correo],
    );
    if ((rows as any[]).length === 0) {
      return null;
    }
    const row = (rows as any[])[0];
    return new CodigoVerificacion(
      row.idCodigoVerificacion,
      row.correo,
      row.codigo,
      new Date(row.fecha_expiracion),
      new Date(row.created_at),
    );
  }

  async deleteByCorreo(correo: string, connection?: any): Promise<void> {
    const executor = connection || pool;
    await executor.execute(
      `DELETE FROM CodigoVerificacion WHERE correo = ?`,
      [correo],
    );
  }
}
