export type RolUsuario = 'Paciente' | 'Medico' | 'Administrador';

export class Usuario {
  constructor(
    public readonly idUsuario: number,
    public readonly contrasena: string,
    public readonly nombres: string,
    public readonly apellidos: string,
    public readonly correo: string,
    public readonly telefono: string | null,
    public readonly rol: RolUsuario | string,
  ) {}
}

