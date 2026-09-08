class Cita {
  constructor(
    idCita,
    Paciente_idPaciente,
    Medico_idMedico,
    Fecha,
    Hora,
    motivo,
  ) {
    this.idCita = idCita;
    this.Paciente_idPaciente = Paciente_idPaciente;
    this.Medico_idMedico = Medico_idMedico;
    this.Fecha = Fecha;
    this.Hora = Hora;
    this.motivo = motivo;
  }
}

module.exports = {
  Cita,
};

