"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PacienteRepositoryMySQL = void 0;
const PoolConexion_1 = require("../database/PoolConexion");
class PacienteRepositoryMySQL {
    async create(paciente, connection) {
        const executor = connection || PoolConexion_1.pool;
        const sql = `INSERT INTO Paciente (Usuario_idUsuario) VALUES (?);`;
        const [result] = await executor.execute(sql, [
            paciente.idUsuario,
        ]);
        return result.insertId;
    }
}
exports.PacienteRepositoryMySQL = PacienteRepositoryMySQL;
