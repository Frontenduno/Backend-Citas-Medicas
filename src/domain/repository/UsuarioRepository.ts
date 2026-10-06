import { Usuario } from '../entity/Usuario';

export interface UsuarioRepository {
  save(usuario: Usuario): Promise<Usuario>;
  update(id: number, usuario: Partial<Usuario>): Promise<Usuario>;
  delete(id: number): Promise<void>;
  findById(id: number): Promise<Usuario | null>;
  findByCorreo(correo: string): Promise<Usuario | null>;
  findAll(): Promise<Usuario[]>;
}
