import { Genero } from "../../domain/enum/Genero";
import { Rol } from "../../domain/enum/Rol";

export interface RegistrarseDTO {
    nombres: string;
    apellidos: string;
    correo: string;
    contrasena: string;
    documento_identidad: string;
    telefono: string;
    genero: Genero;
    fecha_nacimiento: Date;
    rol: Rol;
}

export interface IniciarSesionDTO {
    correo: string;
    contrasena: string;
}