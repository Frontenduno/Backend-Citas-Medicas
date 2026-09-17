import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { Usuario } from '../../../domain/entities/Usuario';

export class FindUserByEmailUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(email: string): Promise<Usuario | null> {
    return await this.userRepository.findUsuariobyEmail(email);
  }
}

