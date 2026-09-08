class TicketCita {
  constructor(
    idTicketCita,
    codigoTicket,
    Cita_idCita,
    codigoPago,
    estado,
  ) {
    this.idTicketCita = idTicketCita;
    this.codigoTicket = codigoTicket;
    this.Cita_idCita = Cita_idCita;
    this.codigoPago = codigoPago;
    this.estado = estado;
  }
}

module.exports = {
  TicketCita,
};

