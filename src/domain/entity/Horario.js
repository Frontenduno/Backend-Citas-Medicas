class Horario {
  constructor(
    idHorario,
    diaSemana,
    turno,
    horaInicio,
    horaFin,
    Medico_idMedico,
  ) {
    this.idHorario = idHorario;
    this.diaSemana = diaSemana;
    this.turno = turno;
    this.horaInicio = horaInicio;
    this.horaFin = horaFin;
    this.Medico_idMedico = Medico_idMedico;
  }
}

module.exports = {
  Horario,
};

