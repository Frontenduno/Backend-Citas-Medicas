const historialRepository = require("../../../src/infrastructure/repositories/HistorialRepository");
const citaRepository = require("../../../src/infrastructure/repositories/CitaRepository");

describe("Test de los métodos de HistorialRepository", () => {
  let citaCreada = null;
  let historialCreado = null;

  // Crear una cita de prueba antes de los tests
  beforeAll(async () => {
    const result = await citaRepository.createCita(1, 1, "2027-07-20", "10:00:00", "Cita para test historial");
    citaCreada = result;
  });

  // Limpiar la cita de prueba después de los tests
  afterAll(async () => {
    if (citaCreada) {
      await citaRepository.deleteCita(citaCreada.cita.idCita);
    }
  });

  test("Debe crear un historial clínico", async () => {
    const result = await historialRepository.createHistorial(
      citaCreada.cita.idCita,
      "Diagnóstico de prueba",
      "Tratamiento de prueba",
      "Observaciones de prueba",
    );

    expect(result).toHaveProperty("idHistorial");
    expect(result.diagnostico).toBe("Diagnóstico de prueba");
    expect(result.Cita_idCita).toBe(citaCreada.cita.idCita);

    historialCreado = result;
  });

  test("Debe encontrar el historial por cita", async () => {
    const result = await historialRepository.findHistorialByCita(citaCreada.cita.idCita);

    expect(result).not.toBeNull();
    expect(result.idHistorial).toBe(historialCreado.idHistorial);
    expect(result.diagnostico).toBe("Diagnóstico de prueba");
  });

  test("Debe listar historiales de un paciente", async () => {
    const result = await historialRepository.findHistorialesByPaciente(1);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("historial");
    expect(result[0]).toHaveProperty("cita");
  });

  test("Debe actualizar un historial clínico", async () => {
    const result = await historialRepository.updateHistorial(
      historialCreado.idHistorial,
      "Diagnóstico actualizado",
      "Tratamiento actualizado",
      "Observaciones actualizadas",
    );

    expect(result).toBe(true);

    // Verificar que se actualizó correctamente
    const historial = await historialRepository.findHistorialByCita(citaCreada.cita.idCita);
    expect(historial.diagnostico).toBe("Diagnóstico actualizado");
  });

  test("Debe retornar null para una cita sin historial", async () => {
    const result = await historialRepository.findHistorialByCita(99999);

    expect(result).toBeNull();
  });

  test("Debe eliminar un historial clínico", async () => {
    const result = await historialRepository.deleteHistorial(historialCreado.idHistorial);

    expect(result).toBe(true);
  });

  test("El historial eliminado no debe existir", async () => {
    const result = await historialRepository.findHistorialByCita(citaCreada.cita.idCita);

    expect(result).toBeNull();
  });
});

