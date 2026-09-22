"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactoEmergenciaMySQL = void 0;
const PoolConexion_1 = require("../database/PoolConexion");
class ContactoEmergenciaMySQL {
    async register(contactoEmergencia, connection) {
        const executor = connection || PoolConexion_1.pool;
        const sql = "INSERT INTO `ContactoEmergencia`" +
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
exports.ContactoEmergenciaMySQL = ContactoEmergenciaMySQL;
