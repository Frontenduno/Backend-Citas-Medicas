export class Cita {
  constructor(
    public readonly idCita: number,
    public readonly Paciente_idPaciente: number,
    public readonly Medico_idMedico: number,
    public readonly Fecha: Date,
    public readonly Hora: Date,
    public readonly motivo?: string
  ) { }
}