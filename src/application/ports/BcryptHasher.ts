export interface IBcryptHasher {
  encriptarContrasena(contrasena: string): Promise<string>;
  compararContrasenas(contrasenaIngresada: string, contrasenaHasheada: string): Promise<boolean>;
}
