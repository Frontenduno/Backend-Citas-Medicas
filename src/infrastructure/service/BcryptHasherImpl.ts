import bcrypt from 'bcryptjs';
import { IBcryptHasher } from '../../application/ports/BcryptHasher';

export class BcryptHasherImpl implements IBcryptHasher {
  async encriptarContrasena(contrasena: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(contrasena, salt);
  }

  async compararContrasenas(contrasenaIngresada: string, contrasenaHasheada: string): Promise<boolean> {
    return await bcrypt.compare(contrasenaIngresada, contrasenaHasheada);
  }
}
