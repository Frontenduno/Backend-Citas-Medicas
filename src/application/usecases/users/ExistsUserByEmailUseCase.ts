import { IUsuarioRepository } from '../../../domain/repository/UsuarioRepository';

export class ExistsUserByEmailUseCase {
  constructor(private readonly userRepository: IUsuarioRepository) {}

  async execute(email: string): Promise<boolean> {
    return await this.userRepository.existsByEmail(email);
  }
}

