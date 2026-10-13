import { Genero } from "../enum/Genero";
import { Rol } from "../enum/Rol";

export class Usuario {
  constructor(
    public readonly idUsuario: number,
    public readonly contrasena: string,
    public readonly nombres: string,
    public readonly apellidos: string,
    public readonly correo: string,
    public readonly documento_identidad: string,
    public readonly telefono: string,
    public readonly genero: Genero,
    public readonly fecha_nacimiento: Date,
    public readonly rol: Rol,
    public readonly verificado: boolean = false,
    public readonly created_at?: Date,
    public readonly updated_at?: Date
  ) { }
}