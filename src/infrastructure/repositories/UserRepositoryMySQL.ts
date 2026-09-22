import { pool } from '../database/PoolConexion';
import { Usuario } from '../../domain/entity/Usuario';
import { IUsuarioRepository } from '../../domain/repository/UsuarioRepository';

export class UsuarioRepositoryMySQL implements IUsuarioRepository {
  async existsByEmail(email: string, connection?: any): Promise<boolean> {
    const executor = connection || pool;
    const [rows] = await executor.execute(
      'SELECT idUsuario FROM Usuario WHERE correo = ?',
      [email],
    );
    return rows.length > 0;
  }

  async findByEmail(email: string, connection?: any): Promise<Usuario | null> {
    const executor = connection || pool;
    const [rows] = await executor.execute(
      'SELECT * FROM Usuario WHERE correo = ?',
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
      userResult.fecha_nacimiento,
      userResult.genero,
      userResult.rol,
      Boolean(userResult.correo_verificado),
      userResult.fecha_verificacion_correo ? new Date(userResult.fecha_verificacion_correo) : null
    );
  }

  async create(usuario: Usuario, connection?: any): Promise<number> {
    const executor = connection || pool;
    const [result] = await executor.execute(
      `INSERT INTO Usuario (contrasena, nombres, apellidos, correo, telefono, fecha_nacimiento, genero, rol) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        usuario.contrasena,
        usuario.nombres,
        usuario.apellidos,
        usuario.correo,
        usuario.telefono,
        usuario.fecha_nacimiento,
        usuario.genero,
        usuario.rol,
      ],
    );
    return result.insertId;
  }

  async guardar(usuario: Usuario, connection?: any): Promise<void> {
    const executor = connection || pool;
    await executor.execute(
      `UPDATE Usuario SET contrasena = ?, correo_verificado = ?, fecha_verificacion_correo = ? WHERE idUsuario = ?`,
      [
        usuario.contrasena,
        usuario.correoVerificado ? 1 : 0,
        usuario.fechaVerificacionCorreo,
        usuario.idUsuario
      ]
    );
  }

  async marcarCorreoVerificado(usuarioId: number, connection?: any): Promise<void> {
    const executor = connection || pool;
    await executor.execute(
      `UPDATE Usuario SET correo_verificado = TRUE, fecha_verificacion_correo = NOW() WHERE idUsuario = ?`,
      [usuarioId]
    );
  }
}
