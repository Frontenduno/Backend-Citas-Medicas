const { getConnection } = require("../database/PoolConexion");
const { Cita } = require("../../domain/entity/Cita");
const { TicketCita } = require("../../domain/entity/TicketCita");
const { Horario } = require("../../domain/entity/Horario");


/**
 * Genera un código de ticket único con formato TK-XXXX
 */
function generarCodigoTicket() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TK-${timestamp}-${random}`;
}

/**
 * Genera un código de pago único con formato PAG-XXXX
 */
function generarCodigoPago() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PAG-${timestamp}-${random}`;
}

/**
 * Crea una nueva cita y genera automáticamente su TicketCita con su código de pago
 */
async function createCita(pacienteId, medicoId, fecha, hora, motivo) {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();

    const [citaResult] = await connection.execute(
      "INSERT INTO Cita (Paciente_idPaciente, Medico_idMedico, Fecha, Hora, motivo) VALUES (?, ?, ?, ?, ?)",
      [pacienteId, medicoId, fecha, hora, motivo],
    );

    const idCita = citaResult.insertId;
    const codigoTicket = generarCodigoTicket();
    const codigoPago = generarCodigoPago();

    const [ticketResult] = await connection.execute(
      "INSERT INTO TicketCita (codigoTicket, Cita_idCita, codigoPago, estado) VALUES (?, ?, ?, 'Pendiente')",
      [codigoTicket, idCita, codigoPago],
    );

    await connection.commit();

    return {
      cita: new Cita(idCita, pacienteId, medicoId, fecha, hora, motivo),
      ticket: new TicketCita(ticketResult.insertId, codigoTicket, idCita, codigoPago, "Pendiente"),
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Busca una cita por su ID, incluyendo datos del ticket
 */
async function findCitaById(idCita) {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT c.*, tc.idTicketCita, tc.codigoTicket, tc.codigoPago, tc.estado
       FROM Cita c
       LEFT JOIN TicketCita tc ON tc.Cita_idCita = c.idCita
       WHERE c.idCita = ?`,
      [idCita],
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      cita: new Cita(row.idCita, row.Paciente_idPaciente, row.Medico_idMedico, row.Fecha, row.Hora, row.motivo),
      ticket: row.idTicketCita
        ? new TicketCita(row.idTicketCita, row.codigoTicket, row.idCita, row.codigoPago, row.estado)
        : null,
    };
  } finally {
    connection.release();
  }
}

/**
 * Lista todas las citas de un paciente
 */
async function findCitasByPaciente(pacienteId) {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT c.*, tc.idTicketCita, tc.codigoTicket, tc.codigoPago, tc.estado
       FROM Cita c
       LEFT JOIN TicketCita tc ON tc.Cita_idCita = c.idCita
       WHERE c.Paciente_idPaciente = ?
       ORDER BY c.Fecha DESC, c.Hora DESC`,
      [pacienteId],
    );

    return rows.map((row) => ({
      cita: new Cita(row.idCita, row.Paciente_idPaciente, row.Medico_idMedico, row.Fecha, row.Hora, row.motivo),
      ticket: row.idTicketCita
        ? new TicketCita(row.idTicketCita, row.codigoTicket, row.idCita, row.codigoPago, row.estado)
        : null,
    }));
  } finally {
    connection.release();
  }
}

/**
 * Lista todas las citas de un médico
 */
async function findCitasByMedico(medicoId) {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT c.*, tc.idTicketCita, tc.codigoTicket, tc.codigoPago, tc.estado
       FROM Cita c
       LEFT JOIN TicketCita tc ON tc.Cita_idCita = c.idCita
       WHERE c.Medico_idMedico = ?
       ORDER BY c.Fecha DESC, c.Hora DESC`,
      [medicoId],
    );

    return rows.map((row) => ({
      cita: new Cita(row.idCita, row.Paciente_idPaciente, row.Medico_idMedico, row.Fecha, row.Hora, row.motivo),
      ticket: row.idTicketCita
        ? new TicketCita(row.idTicketCita, row.codigoTicket, row.idCita, row.codigoPago, row.estado)
        : null,
    }));
  } finally {
    connection.release();
  }
}

/**
 * Lista todas las citas de una fecha específica
 */
async function findCitasByFecha(fecha) {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT c.*, tc.idTicketCita, tc.codigoTicket, tc.codigoPago, tc.estado
       FROM Cita c
       LEFT JOIN TicketCita tc ON tc.Cita_idCita = c.idCita
       WHERE c.Fecha = ?
       ORDER BY c.Hora ASC`,
      [fecha],
    );

    return rows.map((row) => ({
      cita: new Cita(row.idCita, row.Paciente_idPaciente, row.Medico_idMedico, row.Fecha, row.Hora, row.motivo),
      ticket: row.idTicketCita
        ? new TicketCita(row.idTicketCita, row.codigoTicket, row.idCita, row.codigoPago, row.estado)
        : null,
    }));
  } finally {
    connection.release();
  }
}

/**
 * Actualiza el estado de una cita a través de su TicketCita
 * Estados válidos: 'Pendiente', 'Confirmado', 'Cancelado'
 */
async function updateEstadoCita(idTicketCita, estado) {
  const connection = await getConnection();
  try {
    const [result] = await connection.execute(
      "UPDATE TicketCita SET estado = ? WHERE idTicketCita = ?",
      [estado, idTicketCita],
    );

    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
}

/**
 * Elimina una cita y sus registros asociados (TicketCita)
 */
async function deleteCita(idCita) {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();

    // Eliminar pagos asociados al ticket de la cita
    await connection.execute(
      `DELETE p FROM Pago p
       INNER JOIN TicketCita tc ON tc.idTicketCita = p.TicketCita_idTicketCita
       WHERE tc.Cita_idCita = ?`,
      [idCita],
    );

    // Eliminar historial clínico asociado
    await connection.execute(
      "DELETE FROM HistorialClinico WHERE Cita_idCita = ?",
      [idCita],
    );

    // Eliminar ticket de cita
    await connection.execute(
      "DELETE FROM TicketCita WHERE Cita_idCita = ?",
      [idCita],
    );

    // Eliminar la cita
    const [result] = await connection.execute(
      "DELETE FROM Cita WHERE idCita = ?",
      [idCita],
    );

    await connection.commit();
    return result.affectedRows > 0;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Verifica la disponibilidad de un médico en una fecha y hora específicas.
 * Retorna true si el médico está disponible, false si ya tiene una cita agendada.
 */
async function verificarDisponibilidad(medicoId, fecha, hora) {
  const connection = await getConnection();
  try {
    // Verificar si ya existe una cita para ese médico en esa fecha y hora
    const [citas] = await connection.execute(
      "SELECT idCita FROM Cita WHERE Medico_idMedico = ? AND Fecha = ? AND Hora = ?",
      [medicoId, fecha, hora],
    );

    if (citas.length > 0) {
      return { disponible: false, motivo: "El médico ya tiene una cita agendada en esa fecha y hora" };
    }

    // Verificar que el médico tenga horario asignado para ese día
    const diasSemana = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
    const diasConTilde = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    // Desglosar año, mes y día para evitar desfase de zona horaria UTC vs local
    const [year, month, day] = fecha.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);
    const diaIndex = dateObj.getDay();
    const diaSinTilde = diasSemana[diaIndex];
    const diaConTilde = diasConTilde[diaIndex];

    const [horarios] = await connection.execute(
      "SELECT * FROM Horario WHERE Medico_idMedico = ? AND (diaSemana = ? OR diaSemana = ?)",
      [medicoId, diaSinTilde, diaConTilde],
    );

    if (horarios.length === 0) {
      return { disponible: false, motivo: `El médico no tiene horario asignado para el día ${diaConTilde}` };
    }

    // Verificar que la hora esté dentro del rango del horario
    const horario = horarios[0];
    if (hora < horario.horaInicio || hora >= horario.horaFin) {
      return {
        disponible: false,
        motivo: `La hora está fuera del horario del médico (${horario.horaInicio} - ${horario.horaFin})`,
      };
    }

    return { disponible: true, horario: new Horario(
      horario.idHorario, horario.diaSemana, horario.turno,
      horario.horaInicio, horario.horaFin, horario.Medico_idMedico,
    )};
  } finally {
    connection.release();
  }
}

module.exports = {
  createCita,
  findCitaById,
  findCitasByPaciente,
  findCitasByMedico,
  findCitasByFecha,
  updateEstadoCita,
  deleteCita,
  verificarDisponibilidad,
};

