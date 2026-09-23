import { IUsuarioRepository } from '../../../domain/repository/UsuarioRepository';
import { Usuario } from '../../../domain/entity/Usuario';

export class FindUserByEmailUseCase {
  constructor(private readonly userRepository: IUsuarioRepository) {}

  async execute(email: string): Promise<Usuario | null> {
    return await this.userRepository.findUsuariobyEmail(email);
  }
}

