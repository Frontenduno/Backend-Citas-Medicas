export interface Payload {
  correo: string;
  idUsuario: string;
  rol: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtGenerator {
  generarToken(payload: Payload): Promise<string>;
  generarAccessToken(payload: Payload): Promise<string>;
  generarRefreshToken(payload: Payload): Promise<string>;
  decodificarToken(token: string): Promise<Payload>;
  decodificarRefreshToken(token: string): Promise<Payload>;
}