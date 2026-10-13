import jwt from 'jsonwebtoken';
import { JwtGenerator, Payload } from '../../application/port/JwtGenerator';

export class JsonWebTokenGenerator implements JwtGenerator {
  private readonly secret: string;
  private readonly expiresIn: string;
  private readonly refreshSecret: string;
  private readonly refreshExpiresIn: string;

  constructor(
    secret: string = process.env.JWT_SECRET || 'default_jwt_secret',
    expiresIn: string = process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: string = process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET ? process.env.JWT_SECRET + '_refresh' : 'default_jwt_refresh_secret'),
    refreshExpiresIn: string = process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  ) {
    this.secret = secret;
    this.expiresIn = expiresIn;
    this.refreshSecret = refreshSecret;
    this.refreshExpiresIn = refreshExpiresIn;
  }

  async generarAccessToken(payload: Payload): Promise<string> {
    return this.signToken(payload, this.secret, this.expiresIn);
  }

  async generarRefreshToken(payload: Payload): Promise<string> {
    return this.signToken(payload, this.refreshSecret, this.refreshExpiresIn);
  }

  async generarToken(payload: Payload): Promise<string> {
    return this.generarAccessToken(payload);
  }

  async decodificarToken(token: string): Promise<Payload> {
    return this.verifyToken(token, this.secret);
  }

  async decodificarRefreshToken(token: string): Promise<Payload> {
    return this.verifyToken(token, this.refreshSecret);
  }

  private signToken(payload: Payload, secret: string, expiresIn: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      jwt.sign(
        { ...payload },
        secret,
        { expiresIn: expiresIn as any },
        (err, token) => {
          if (err || !token) {
            return reject(err || new Error('Error al generar el token JWT'));
          }
          resolve(token);
        }
      );
    });
  }

  private verifyToken(token: string, secret: string): Promise<Payload> {
    return new Promise<Payload>((resolve, reject) => {
      jwt.verify(token, secret, (err, decoded) => {
        if (err || !decoded) {
          return reject(err || new Error('Token JWT inválido o expirado'));
        }
        const data = decoded as any;
        resolve({
          correo: data.correo,
          idUsuario: String(data.idUsuario),
          rol: data.rol,
        });
      });
    });
  }
}
