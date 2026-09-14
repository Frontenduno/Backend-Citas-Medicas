"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioRepositoryMySQL = void 0;
const PoolConexion_1 = require("../database/PoolConexion");
const Usuario_1 = require("../../domain/entity/Usuario");
class UsuarioRepositoryMySQL {
    async existsByEmail(email, connection) {
        const executor = connection || PoolConexion_1.pool;
        const [rows] = await executor.execute('SELECT idUsuario FROM Usuario WHERE correo = ?', [email]);
        return rows.length > 0;
    }
    async findByEmail(email, connection) {
        const executor = connection || PoolConexion_1.pool;
        const [rows] = await executor.execute('SELECT * FROM Usuario WHERE correo = ?', [email]);
        if (rows.length === 0) {
            return null;
        }
        const userResult = rows[0];
        return new Usuario_1.Usuario(userResult.idUsuario, userResult.contrasena, userResult.nombres, userResult.apellidos, userResult.correo, userResult.telefono, userResult.fecha_nacimiento, userResult.genero, userResult.rol);
    }
    async create(usuario, connection) {
        const executor = connection || PoolConexion_1.pool;
        const [result] = await executor.execute(`INSERT INTO Usuario (contrasena, nombres, apellidos, correo, telefono, fecha_nacimiento, genero, rol) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
            usuario.contrasena,
            usuario.nombres,
            usuario.apellidos,
            usuario.correo,
            usuario.telefono,
            usuario.fecha_nacimiento,
            usuario.genero,
            usuario.rol,
        ]);
        return result.insertId;
    }
}
exports.UsuarioRepositoryMySQL = UsuarioRepositoryMySQL;
