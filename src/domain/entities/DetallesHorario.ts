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

export class DetallesHorario {
  constructor(
    public readonly idDetallesHorario: number,
    public readonly diaSemana: DiaSemana,
    public readonly turno: string,
    public readonly horaInicio: string,
    public readonly horaFin: string,
    public readonly Horario_idHorario: number,
  ) {}
}
