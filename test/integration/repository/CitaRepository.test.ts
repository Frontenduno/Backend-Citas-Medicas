import { MySQLCitaRepository } from '../../../src/infrastructure/repositories/MySQLCitaRepository';
import { closeConnection } from '../../../src/infrastructure/database/PoolConexion';
import { Cita } from '../../../src/domain/entity/Cita';
import { TicketCita } from '../../../src/domain/entity/TicketCita';

describe('Test de los métodos de MySQLCitaRepository (TypeScript)', () => {
  const repository = new MySQLCitaRepository();
  let citaCreada: { cita: Cita; ticket: TicketCita } | null = null;

  afterAll(async () => {
    await closeConnection();
  });

  test('Debe verificar la disponibilidad de un médico', async () => {
    const result = await repository.verificarDisponibilidad(1, '2027-01-18', '09:00:00');
    expect(result).toHaveProperty('disponible');
  });

  test('Debe crear una nueva cita con su TicketCita y código de pago generado', async () => {
    const result = await repository.createCita(
      1,
      1,
      '2027-06-14',
      '09:00:00',
      'Consulta de prueba TypeScript',
    );

    expect(result).toHaveProperty('cita');
    expect(result).toHaveProperty('ticket');
    expect(result.cita.Paciente_idPaciente).toBe(1);
    expect(result.cita.Medico_idMedico).toBe(1);
    expect(result.ticket.estado).toBe('Pendiente');
    expect(result.ticket.codigoTicket).toMatch(/^TK-/);
    expect(result.ticket.codigoPago).toMatch(/^PAG-/);

    citaCreada = result;
  });

  test('Debe encontrar una cita por su ID', async () => {
    expect(citaCreada).not.toBeNull();
    const result = await repository.findCitaById(citaCreada!.cita.idCita);

    expect(result).not.toBeNull();
    expect(result!.cita.idCita).toBe(citaCreada!.cita.idCita);
    expect(result!.ticket?.codigoPago).toMatch(/^PAG-/);
  });

  test('Debe listar las citas de un paciente', async () => {
    const result = await repository.findCitasByPaciente(1);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  test('Debe listar las citas de un médico', async () => {
    const result = await repository.findCitasByMedico(1);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  test('Debe listar las citas de una fecha', async () => {
    const result = await repository.findCitasByFecha('2027-06-14');

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  test('Debe actualizar el estado de una cita a Confirmado', async () => {
    expect(citaCreada).not.toBeNull();
    const result = await repository.updateEstadoCita(
      citaCreada!.ticket.idTicketCita,
      'Confirmado',
    );

    expect(result).toBe(true);
  });

  test('Debe indicar que el médico no está disponible si ya tiene cita a esa hora', async () => {
    const result = await repository.verificarDisponibilidad(1, '2027-06-14', '09:00:00');
    expect(result.disponible).toBe(false);
  });

  test('Debe eliminar una cita y sus registros asociados', async () => {
    expect(citaCreada).not.toBeNull();
    const result = await repository.deleteCita(citaCreada!.cita.idCita);
    expect(result).toBe(true);
  });

  test('La cita eliminada no debe existir en la base de datos', async () => {
    expect(citaCreada).not.toBeNull();
    const result = await repository.findCitaById(citaCreada!.cita.idCita);
    expect(result).toBeNull();
  });
});

