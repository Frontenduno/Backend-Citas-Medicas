export type DiaSemana =
  | 'Domingo'
  | 'Lunes'
  | 'Martes'
  | 'Miercoles'
  | 'Miércoles'
  | 'Jueves'
  | 'Viernes'
  | 'Sabado'
  | 'Sábado';

export class Horario {
  constructor(
    public readonly idHorario: number,
    public readonly diaSemana: DiaSemana,
    public readonly turno: string,
    public readonly horaInicio: string,
    public readonly horaFin: string,
    public readonly Medico_idMedico: number,
  ) {}
}

