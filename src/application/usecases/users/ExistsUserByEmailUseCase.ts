import { IUserRepository } from '../../../domain/repositories/IUserRepository';

export class ExistsUserByEmailUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(email: string): Promise<boolean> {
    return await this.userRepository.existsByEmail(email);
  }
}

