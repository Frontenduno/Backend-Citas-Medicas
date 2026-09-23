import jwt from "jsonwebtoken";
import { IJwtGenerator } from "../../application/ports/JwtGenerator";

const JWT_SECRET = process.env.JWT_SECRET || "secreto_super_seguro_123";

export class JwtGeneratorImpl implements IJwtGenerator {
  firmarCredenciales(
    payload: { id: number; correo: string; rol: string },
    tiempoExpiracion?: string,
  ): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: tiempoExpiracion || "1h",
    } as jwt.SignOptions);
  }

  verificarToken(token: string): { id: number; correo: string; rol: string } {
    return jwt.verify(token, JWT_SECRET) as { id: number; correo: string; rol: string };
  }
}
