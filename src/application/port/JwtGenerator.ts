export interface Payload {
    correo: string;
    idUsuario: string;
    rol: string;
}

export interface JwtGenerator {
    generarToken(payload: Payload): Promise<string>;
    decodificarToken(token: string): Promise<Payload>;
}