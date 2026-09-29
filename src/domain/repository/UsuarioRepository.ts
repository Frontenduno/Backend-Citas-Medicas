import { Usuario } from '../entity/Usuario';

export interface IUsuarioRepository {
  existsByEmail(email: string, connection?: any): Promise<boolean>;
  findUsuariobyEmail(email: string, connection?: any): Promise<Usuario | null>;
  create(usuario: Usuario, connection?: any): Promise<number>;
  updateVerificado(correo: string, verificado: boolean, connection?: any): Promise<void>;
}
