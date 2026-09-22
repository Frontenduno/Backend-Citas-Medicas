import { pool } from '../database/PoolConexion';
import { CodigoVerificacionRepository } from '../../application/ports/CodigoVerificacionRepository';
import { CodigoVerificacion, TipoVerificacion } from '../../domain/entity/CodigoVerificacion';

export class CodigoVerificacionRepositoryMySQL implements CodigoVerificacionRepository {
  async invalidarPendientes(usuarioId: number, tipo: TipoVerificacion, connection?: any): Promise<void> {
    const executor = connection || pool;
    await executor.execute(
      `UPDATE VerificacionCorreo SET estado='EXPIRADO' WHERE Usuario_idUsuario=? AND tipo=? AND estado='PENDIENTE'`,
      [usuarioId, tipo]
    );
  }

  async crear(codigo: CodigoVerificacion, connection?: any): Promise<CodigoVerificacion> {
    const executor = connection || pool;
    const [result] = await executor.execute(
      `INSERT INTO VerificacionCorreo 
        (Usuario_idUsuario, tipo, codigo_hash, estado, intentos, max_intentos, expira_en, ip_solicitud, user_agent, fecha_creacion) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        codigo.usuarioId,
        codigo.tipo,
        codigo.codigoHash,
        codigo.estado,
        codigo.intentos,
        codigo.maxIntentos,
        codigo.expiraEn,
        codigo.ipSolicitud,
        codigo.userAgent,
        codigo.fechaCreacion
      ]
    );
    return new CodigoVerificacion(
      result.insertId,
      codigo.usuarioId,
      codigo.tipo,
      codigo.codigoHash,
      codigo.estado,
      codigo.intentos,
      codigo.maxIntentos,
      codigo.expiraEn,
      codigo.ipSolicitud,
      codigo.userAgent,
      codigo.fechaCreacion,
      codigo.fechaUso
    );
  }

  async buscarUltimoPendiente(usuarioId: number, tipo: TipoVerificacion, connection?: any): Promise<CodigoVerificacion | null> {
    const executor = connection || pool;
    const [rows] = await executor.execute(
      `SELECT * FROM VerificacionCorreo WHERE Usuario_idUsuario=? AND tipo=? AND estado='PENDIENTE' ORDER BY fecha_creacion DESC LIMIT 1`,
      [usuarioId, tipo]
    );
    
    if (rows.length === 0) return null;
    const row = rows[0];
    
    return new CodigoVerificacion(
      row.idVerificacion,
      row.Usuario_idUsuario,
      row.tipo as TipoVerificacion,
      row.codigo_hash,
      row.estado,
      row.intentos,
      row.max_intentos,
      new Date(row.expira_en),
      row.ip_solicitud,
      row.user_agent,
      new Date(row.fecha_creacion),
      row.fecha_uso ? new Date(row.fecha_uso) : null
    );
  }

  async actualizar(codigo: CodigoVerificacion, connection?: any): Promise<void> {
    const executor = connection || pool;
    await executor.execute(
      `UPDATE VerificacionCorreo SET estado=?, intentos=?, fecha_uso=? WHERE idVerificacion=?`,
      [codigo.estado, codigo.intentos, codigo.fechaUso, codigo.idCodigo]
    );
  }

  async contarRecientes(usuarioId: number, tipo: TipoVerificacion, segundos: number, connection?: any): Promise<number> {
    const executor = connection || pool;
    const [rows] = await executor.execute(
      `SELECT COUNT(*) as conteo FROM VerificacionCorreo WHERE Usuario_idUsuario=? AND tipo=? AND fecha_creacion >= DATE_SUB(NOW(), INTERVAL ? SECOND)`,
      [usuarioId, tipo, segundos]
    );
    return rows[0].conteo;
  }

  async contarPorIp(ip: string, segundos: number, connection?: any): Promise<number> {
    const executor = connection || pool;
    const [rows] = await executor.execute(
      `SELECT COUNT(*) as conteo FROM VerificacionCorreo WHERE ip_solicitud=? AND fecha_creacion >= DATE_SUB(NOW(), INTERVAL ? SECOND)`,
      [ip, segundos]
    );
    return rows[0].conteo;
  }

  async purgarAntiguas(dias: number, connection?: any): Promise<number> {
    const executor = connection || pool;
    const [result] = await executor.execute(
      `DELETE FROM VerificacionCorreo WHERE estado IN ('USADO', 'EXPIRADO', 'BLOQUEADO') AND fecha_creacion < DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [dias]
    );
    return result.affectedRows;
  }
}

