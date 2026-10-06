import { DiaSemana } from "../enum/DiaSemana";
import { Turno } from "../enum/Turno";

export class DetallesHorario {
  constructor(
    public readonly idDetallesHorario: number,
    public readonly diaSemana: DiaSemana,
    public readonly turno: Turno,
    public readonly horaInicio: Date,
    public readonly horaFin: Date,
    public readonly Horario_idHorario: number
  ) { }
}