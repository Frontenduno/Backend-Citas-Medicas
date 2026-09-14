export class Usuario {
  idUsuario?: number;
  contrasena: string;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  fecha_nacimiento: string;
  genero: string;
  rol: string;

  constructor(
    idUsuario: number | null,
    contrasena: string,
    nombres: string,
    apellidos: string,
    correo: string,
    telefono: string,
    fecha_nacimiento: string,
    genero: string,
    rol: string,
  ) {
    this.idUsuario = idUsuario ?? undefined;
    this.contrasena = contrasena;
    this.nombres = nombres;
    this.apellidos = apellidos;
    this.correo = correo;
    this.telefono = telefono;
    this.fecha_nacimiento = fecha_nacimiento;
    this.genero = genero;
    this.rol = rol;
  }
}
