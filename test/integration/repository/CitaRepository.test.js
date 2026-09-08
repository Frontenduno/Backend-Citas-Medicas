const citaRepository = require("../../../src/infrastructure/repositories/CitaRepository");

describe("Test de los métodos de CitaRepository", () => {
  let citaCreada = null;

  test("Debe verificar la disponibilidad de un médico", async () => {
    // Verificar disponibilidad para una fecha futura sin citas
    const result = await citaRepository.verificarDisponibilidad(1, "2027-01-15", "09:00:00");
    expect(result).toHaveProperty("disponible");
  });

  test("Debe crear una nueva cita con su TicketCita", async () => {
    const result = await citaRepository.createCita(1, 1, "2027-06-15", "09:00:00", "Consulta de prueba");

    expect(result).toHaveProperty("cita");
    expect(result).toHaveProperty("ticket");
    expect(result.cita.Paciente_idPaciente).toBe(1);
    expect(result.cita.Medico_idMedico).toBe(1);
    expect(result.ticket.estado).toBe("Pendiente");
    expect(result.ticket.codigoTicket).toMatch(/^TK-/);

    citaCreada = result;
  });

  test("Debe encontrar una cita por su ID", async () => {
    const result = await citaRepository.findCitaById(citaCreada.cita.idCita);

    expect(result).not.toBeNull();
    expect(result.cita.idCita).toBe(citaCreada.cita.idCita);
  });

  test("Debe listar las citas de un paciente", async () => {
    const result = await citaRepository.findCitasByPaciente(1);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  test("Debe listar las citas de un médico", async () => {
    const result = await citaRepository.findCitasByMedico(1);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  test("Debe listar las citas de una fecha", async () => {
    const result = await citaRepository.findCitasByFecha("2027-06-15");

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  test("Debe actualizar el estado de una cita", async () => {
    const result = await citaRepository.updateEstadoCita(
      citaCreada.ticket.idTicketCita, "Confirmado",
    );

    expect(result).toBe(true);
  });

  test("Debe indicar que el médico no está disponible si ya tiene cita", async () => {
    const result = await citaRepository.verificarDisponibilidad(1, "2027-06-15", "09:00:00");

    expect(result.disponible).toBe(false);
  });

  test("Debe eliminar una cita y sus registros asociados", async () => {
    const result = await citaRepository.deleteCita(citaCreada.cita.idCita);

    expect(result).toBe(true);
  });

  test("La cita eliminada no debe existir", async () => {
    const result = await citaRepository.findCitaById(citaCreada.cita.idCita);

    expect(result).toBeNull();
  });
});

