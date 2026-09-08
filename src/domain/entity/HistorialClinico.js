class HistorialClinico {
  constructor(
    idHistorial,
    Cita_idCita,
    diagnostico,
    tratamiento,
    observaciones,
    fechaRegistro,
  ) {
    this.idHistorial = idHistorial;
    this.Cita_idCita = Cita_idCita;
    this.diagnostico = diagnostico;
    this.tratamiento = tratamiento;
    this.observaciones = observaciones;
    this.fechaRegistro = fechaRegistro;
  }
}

module.exports = {
  HistorialClinico,
};

