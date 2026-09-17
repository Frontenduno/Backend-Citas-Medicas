export type RolUsuario = 'Paciente' | 'Medico' | 'Administrador';
export type GeneroUsuario = 'Masculino' | 'Femenino' | 'Otro';

export class Usuario {
  constructor(
    public readonly idUsuario: number,
    public readonly contrasena: string,
    public readonly nombres: string,
    public readonly apellidos: string,
    public readonly correo: string,
    public readonly telefono: string | null,
    public readonly fecha_nacimiento: string,
    public readonly genero: GeneroUsuario | string,
    public readonly rol: RolUsuario | string,
  ) {}
}

