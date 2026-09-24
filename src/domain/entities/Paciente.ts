export class Paciente {
  idPaciente?: number;
  idUsuario: number;

  constructor(
    idPaciente: number | null,
    idUsuario: number,
  ) {
    this.idPaciente = idPaciente ?? undefined;
    this.idUsuario = idUsuario;
  }
}
