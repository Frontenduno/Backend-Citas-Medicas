"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodigoVerificacionRepositoryMySQL = void 0;
const PoolConexion_1 = require("../database/PoolConexion");
const CodigoVerificacion_1 = require("../../domain/entity/CodigoVerificacion");
class CodigoVerificacionRepositoryMySQL {
    async invalidarPendientes(usuarioId, tipo, connection) {
        const executor = connection || PoolConexion_1.pool;
        await executor.execute(`UPDATE VerificacionCorreo SET estado='EXPIRADO' WHERE Usuario_idUsuario=? AND tipo=? AND estado='PENDIENTE'`, [usuarioId, tipo]);
    }
    async crear(codigo, connection) {
        const executor = connection || PoolConexion_1.pool;
        const [result] = await executor.execute(`INSERT INTO VerificacionCorreo 
        (Usuario_idUsuario, tipo, codigo_hash, estado, intentos, max_intentos, expira_en, ip_solicitud, user_agent, fecha_creacion) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
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
        ]);
        return new CodigoVerificacion_1.CodigoVerificacion(result.insertId, codigo.usuarioId, codigo.tipo, codigo.codigoHash, codigo.estado, codigo.intentos, codigo.maxIntentos, codigo.expiraEn, codigo.ipSolicitud, codigo.userAgent, codigo.fechaCreacion, codigo.fechaUso);
    }
    async buscarUltimoPendiente(usuarioId, tipo, connection) {
        const executor = connection || PoolConexion_1.pool;
        const [rows] = await executor.execute(`SELECT * FROM VerificacionCorreo WHERE Usuario_idUsuario=? AND tipo=? AND estado='PENDIENTE' ORDER BY fecha_creacion DESC LIMIT 1`, [usuarioId, tipo]);
        if (rows.length === 0)
            return null;
        const row = rows[0];
        return new CodigoVerificacion_1.CodigoVerificacion(row.idVerificacion, row.Usuario_idUsuario, row.tipo, row.codigo_hash, row.estado, row.intentos, row.max_intentos, new Date(row.expira_en), row.ip_solicitud, row.user_agent, new Date(row.fecha_creacion), row.fecha_uso ? new Date(row.fecha_uso) : null);
    }
    async actualizar(codigo, connection) {
        const executor = connection || PoolConexion_1.pool;
        await executor.execute(`UPDATE VerificacionCorreo SET estado=?, intentos=?, fecha_uso=? WHERE idVerificacion=?`, [codigo.estado, codigo.intentos, codigo.fechaUso, codigo.idCodigo]);
    }
    async contarRecientes(usuarioId, tipo, segundos, connection) {
        const executor = connection || PoolConexion_1.pool;
        const [rows] = await executor.execute(`SELECT COUNT(*) as conteo FROM VerificacionCorreo WHERE Usuario_idUsuario=? AND tipo=? AND fecha_creacion >= DATE_SUB(NOW(), INTERVAL ? SECOND)`, [usuarioId, tipo, segundos]);
        return rows[0].conteo;
    }
    async contarPorIp(ip, segundos, connection) {
        const executor = connection || PoolConexion_1.pool;
        const [rows] = await executor.execute(`SELECT COUNT(*) as conteo FROM VerificacionCorreo WHERE ip_solicitud=? AND fecha_creacion >= DATE_SUB(NOW(), INTERVAL ? SECOND)`, [ip, segundos]);
        return rows[0].conteo;
    }
    async purgarAntiguas(dias, connection) {
        const executor = connection || PoolConexion_1.pool;
        const [result] = await executor.execute(`DELETE FROM VerificacionCorreo WHERE estado IN ('USADO', 'EXPIRADO', 'BLOQUEADO') AND fecha_creacion < DATE_SUB(NOW(), INTERVAL ? DAY)`, [dias]);
        return result.affectedRows;
    }
}
exports.CodigoVerificacionRepositoryMySQL = CodigoVerificacionRepositoryMySQL;
