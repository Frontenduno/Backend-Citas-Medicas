const { getConnection } = require("../database/PoolConexion");

async function medicoPerteneceAEspecialidad(idMedico, idEspecialidad) {
  const connection = await getConnection();

  try {
    const [rows] = await connection.execute(
      `SELECT idMedico
       FROM Medico
       WHERE idMedico = ? AND Especialidad_idEspecialidad = ?`,
      [idMedico, idEspecialidad],
    );

    return rows.length > 0;
  } finally {
    connection.release();
  }
}

async function citaYaExiste(idMedico, fecha, hora) {
  const connection = await getConnection();

  try {
    const [rows] = await connection.execute(
      `SELECT idCita
       FROM Cita
       WHERE Medico_idMedico = ? AND Fecha = ? AND Hora = ?`,
      [idMedico, fecha, hora],
    );

    return rows.length > 0;
  } finally {
    connection.release();
  }
}

async function crearCita(Paciente_idPaciente, Medico_idMedico, Fecha, Hora, Motivo) {
    const connection = await getConnection();

    try {
        const [result] = await connection.execute(
            `INSERT  INTO Cita
            (Paciente_idPaciente, Medico_idMedico, Fecha, Hora, Motivo)
            VALUES (?, ?, ?, ?, ?)`,
            [Paciente_idPaciente, Medico_idMedico, Fecha, Hora, Motivo],
        )

        return result.insertId;
    } finally {
        connection.release();
    }
}

module.exports = {
  medicoPerteneceAEspecialidad,
  citaYaExiste,
  crearCita,
};