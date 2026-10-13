import bcrypt from "bcryptjs";
import { PasswordHasher } from "../../application/port/PasswordHasher";

export class BcryptPasswordHasher implements PasswordHasher {
    private readonly saltRounds: number;

    constructor(saltRounds: number = 10) {
        this.saltRounds = saltRounds;
    }

    async hashearContrasena(contrasena: string): Promise<string> {
        return await bcrypt.hash(contrasena, this.saltRounds);
    }

    async compararContrasena(contrasena: string, hashAlmacenado: string): Promise<boolean> {
        return await bcrypt.compare(contrasena, hashAlmacenado);
    }
}
