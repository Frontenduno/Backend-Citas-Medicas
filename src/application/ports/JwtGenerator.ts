export interface IJwtGenerator {
  firmarCredenciales(payload: { correo: string; rol: string }, tiempoExpiracion?: string): string;
}
