"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PacienteRepositoryMySQL = void 0;
const PoolConexion_1 = require("../database/PoolConexion");
const Paciente_1 = require("../../domain/entity/Paciente");
class PacienteRepositoryMySQL {
    async create(paciente, connection) {
        const executor = connection || PoolConexion_1.pool;
        const sql = `INSERT INTO Paciente (Usuario_idUsuario) VALUES (?);`;
        const [result] = await executor.execute(sql, [paciente.idUsuario]);
        return result.insertId;
    }
    async findByIdUsuario(idUsuario, connection) {
        const executor = connection || PoolConexion_1.pool;
        const sql = "SELECT * FROM Paciente WHERE Usuario_idUsuario = ?";
        const [rows] = await executor.execute(sql, [idUsuario]);
        const pacienteResult = rows[0];
        return new Paciente_1.Paciente(pacienteResult.idPaciente, pacienteResult.idUsuario);
    }
}
exports.PacienteRepositoryMySQL = PacienteRepositoryMySQL;
