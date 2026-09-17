import { Usuario } from '../entities/Usuario';

export interface IUserRepository {
  existsByEmail(email: string): Promise<boolean>;
  findUsuariobyEmail(email: string): Promise<Usuario | null>;
}

