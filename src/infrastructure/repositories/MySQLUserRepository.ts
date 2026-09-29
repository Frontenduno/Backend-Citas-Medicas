import { pool } from "../database/PoolConexion";
import { Usuario } from "../../domain/entity/Usuario";
import { IUsuarioRepository } from "../../domain/repository/UsuarioRepository";

export class MySQLUserRepository implements IUsuarioRepository {
  async existsByEmail(email: string, connection?: any): Promise<boolean> {
    const executor = connection || pool;
    const [rows] = await executor.execute(
      "SELECT idUsuario FROM Usuario WHERE correo = ?",
      [email],
    );
    return rows.length > 0;
  }

  async findUsuariobyEmail(email: string, connection?: any) {
    const executor = connection || pool;
    const [rows] = await executor.execute(
      "SELECT * FROM Usuario WHERE correo = ?",
      [email],
    );
    if (rows.length === 0) {
      return null;
    }
    const userResult = rows[0];
    return new Usuario(
      userResult.idUsuario,
      userResult.contrasena,
      userResult.nombres,
      userResult.apellidos,
      userResult.correo,
      userResult.telefono,
      userResult.documento_identidad,
      userResult.fecha_nacimiento,
      userResult.genero,
      userResult.rol,
      userResult.verificado === 1,
    );
  }

  async create(usuario: Usuario, connection?: any): Promise<number> {
    const executor = connection || pool;
    const [result] = await executor.execute(
      `INSERT INTO Usuario (contrasena, nombres, apellidos, correo, telefono, documento_identidad, fecha_nacimiento, genero, rol, verificado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        usuario.contrasena,
        usuario.nombres,
        usuario.apellidos,
        usuario.correo,
        usuario.telefono,
        usuario.documento_identidad,
        usuario.fecha_nacimiento,
        usuario.genero,
        usuario.rol,
        usuario.verificado ? 1 : 0,
      ],
    );
    return result.insertId;
  }

  async updateVerificado(correo: string, verificado: boolean, connection?: any): Promise<void> {
    const executor = connection || pool;
    await executor.execute(
      `UPDATE Usuario SET verificado = ? WHERE correo = ?`,
      [verificado ? 1 : 0, correo],
    );
  }
}
