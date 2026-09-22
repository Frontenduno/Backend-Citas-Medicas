import crypto from 'crypto';
import { CodeGenerator } from '../../application/ports/CodeGenerator';

export class CryptoCodeGenerator implements CodeGenerator {
  generar(): { codigo: string; codigoHash: string } {
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const codigoHash = this.hashear(codigo);
    return { codigo, codigoHash };
  }

  hashear(codigo: string): string {
    return crypto.createHash('sha256').update(codigo).digest('hex');
  }
}

