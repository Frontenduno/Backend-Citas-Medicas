export interface PasswordHasher {
    hashearContrasena(contrasena: string): Promise<string>;
    compararContrasena(contrasena: string, hashAlmacenado: string): Promise<boolean>;
}