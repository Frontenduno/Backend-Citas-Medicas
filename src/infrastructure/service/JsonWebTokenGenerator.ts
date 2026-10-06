import jwt from "jsonwebtoken";
import { JwtGenerator, Payload } from "../../application/port/JwtGenerator";

export class JsonWebTokenGenerator implements JwtGenerator {
    private readonly secret: string;
    private readonly expiresIn: string;

    constructor(
        secret: string = process.env.JWT_SECRET || "default_jwt_secret",
        expiresIn: string = process.env.JWT_EXPIRES_IN || "1d"
    ) {
        this.secret = secret;
        this.expiresIn = expiresIn;
    }

    async generarToken(payload: Payload): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            jwt.sign(
                { ...payload },
                this.secret,
                { expiresIn: this.expiresIn as any },
                (err, token) => {
                    if (err || !token) {
                        return reject(err || new Error("Error al generar el token JWT"));
                    }
                    resolve(token);
                }
            );
        });
    }

    async decodificarToken(token: string): Promise<Payload> {
        return new Promise<Payload>((resolve, reject) => {
            jwt.verify(token, this.secret, (err, decoded) => {
                if (err || !decoded) {
                    return reject(err || new Error("Token JWT inválido o expirado"));
                }
                const data = decoded as any;
                resolve({
                    correo: data.correo,
                    idUsuario: data.idUsuario,
                    rol: data.rol
                });
            });
        });
    }
}
