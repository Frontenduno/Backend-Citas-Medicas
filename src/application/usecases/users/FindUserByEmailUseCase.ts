import { IUsuarioRepository } from '../../../domain/repositories/UsuarioRepository';
import { Usuario } from '../../../domain/entities/Usuario';

export class FindUserByEmailUseCase {
  constructor(private readonly userRepository: IUsuarioRepository) {}

  async execute(email: string): Promise<Usuario | null> {
    return await this.userRepository.findUsuariobyEmail(email);
  }
}

