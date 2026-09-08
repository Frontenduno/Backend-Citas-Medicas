const { getConnection } = require("../database/PoolConexion");
const { HistorialClinico } = require("../../domain/entity/HistorialClinico");


/**
 * Crea un nuevo historial clínico asociado a una cita
 */
async function createHistorial(citaId, diagnostico, tratamiento, observaciones) {
  const connection = await getConnection();
  try {
    const [result] = await connection.execute(
      "INSERT INTO HistorialClinico (Cita_idCita, diagnostico, tratamiento, observaciones) VALUES (?, ?, ?, ?)",
      [citaId, diagnostico, tratamiento || null, observaciones || null],
    );

    return new HistorialClinico(
      result.insertId,
      citaId,
      diagnostico,
      tratamiento || null,
      observaciones || null,
      new Date(),
    );
  } finally {
    connection.release();
  }
}

/**
 * Busca el historial clínico de una cita específica
 */
async function findHistorialByCita(citaId) {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute(
      "SELECT * FROM HistorialClinico WHERE Cita_idCita = ?",
      [citaId],
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    return new HistorialClinico(
      row.idHistorial,
      row.Cita_idCita,
      row.diagnostico,
      row.tratamiento,
      row.observaciones,
      row.fechaRegistro,
    );
  } finally {
    connection.release();
  }
}

/**
 * Lista todos los historiales clínicos de un paciente (JOIN con Cita)
 */
async function findHistorialesByPaciente(pacienteId) {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT h.*, c.Fecha, c.Hora, c.motivo, c.Medico_idMedico
       FROM HistorialClinico h
       INNER JOIN Cita c ON c.idCita = h.Cita_idCita
       WHERE c.Paciente_idPaciente = ?
       ORDER BY h.fechaRegistro DESC`,
      [pacienteId],
    );

    return rows.map((row) => ({
      historial: new HistorialClinico(
        row.idHistorial,
        row.Cita_idCita,
        row.diagnostico,
        row.tratamiento,
        row.observaciones,
        row.fechaRegistro,
      ),
      cita: {
        fecha: row.Fecha,
        hora: row.Hora,
        motivo: row.motivo,
        medicoId: row.Medico_idMedico,
      },
    }));
  } finally {
    connection.release();
  }
}

/**
 * Actualiza un historial clínico existente
 */
async function updateHistorial(idHistorial, diagnostico, tratamiento, observaciones) {
  const connection = await getConnection();
  try {
    const [result] = await connection.execute(
      "UPDATE HistorialClinico SET diagnostico = ?, tratamiento = ?, observaciones = ? WHERE idHistorial = ?",
      [diagnostico, tratamiento || null, observaciones || null, idHistorial],
    );

    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
}

/**
 * Elimina un historial clínico por su ID
 */
async function deleteHistorial(idHistorial) {
  const connection = await getConnection();
  try {
    const [result] = await connection.execute(
      "DELETE FROM HistorialClinico WHERE idHistorial = ?",
      [idHistorial],
    );

    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
}

module.exports = {
  createHistorial,
  findHistorialByCita,
  findHistorialesByPaciente,
  updateHistorial,
  deleteHistorial,
};

