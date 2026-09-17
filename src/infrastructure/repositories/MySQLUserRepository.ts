import { RowDataPacket } from 'mysql2/promise';
import { getConnection } from '../database/PoolConexion';
import { Usuario } from '../../domain/entities/Usuario';
import { IUserRepository } from '../../domain/repositories/IUserRepository';

interface UserRow extends RowDataPacket {
  idUsuario: number;
  contrasena: string;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string | null;
  fecha_nacimiento: string;
  genero: string;
  rol: string;
}

export class MySQLUserRepository implements IUserRepository {
  async existsByEmail(email: string): Promise<boolean> {
    const connection = await getConnection();
    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT idUsuario FROM Usuario WHERE correo = ?',
        [email],
      );
      return rows.length > 0;
    } finally {
      connection.release();
    }
  }

  async findUsuariobyEmail(email: string): Promise<Usuario | null> {
    const connection = await getConnection();
    try {
      const [rows] = await connection.execute<UserRow[]>(
        'SELECT * FROM Usuario WHERE correo = ?',
        [email],
      );

      if (rows.length === 0) return null;

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
      );
    } finally {
      connection.release();
    }
  }
}

