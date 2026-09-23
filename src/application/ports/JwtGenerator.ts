export interface IJwtGenerator {
  firmarCredenciales(payload: { id: number; correo: string; rol: string }, tiempoExpiracion?: string): string;
  verificarToken(token: string): { id: number; correo: string; rol: string };
}
