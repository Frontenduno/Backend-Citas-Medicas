export class Cita {
  constructor(
    public readonly idCita: number,
    public readonly Paciente_idPaciente: number,
    public readonly Medico_idMedico: number,
    public readonly Fecha: string,
    public readonly Hora: string,
    public readonly motivo: string | null = null,
  ) {}
}

