import { Usuario } from '../entity/Usuario';

export interface IUsuarioRepository {
  existsByEmail(email: string, connection?: any): Promise<boolean>;
  findByEmail(email: string, connection?: any): Promise<Usuario | null>;
  create(usuario: Usuario, connection?: any): Promise<number>;
  guardar(usuario: Usuario, connection?: any): Promise<void>;
  marcarCorreoVerificado(usuarioId: number, connection?: any): Promise<void>;
}
