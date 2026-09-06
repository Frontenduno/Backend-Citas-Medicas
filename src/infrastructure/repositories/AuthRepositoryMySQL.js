const { getConnection } = require("../database/PoolConexion");

async function registerPacienteWithTransaction(pacienteData) {
  let connection;
  try {
    connection = await getConnection();
    await connection.beginTransaction();

    // 1. Insert Usuario
    const [usuarioResult] = await connection.execute(
      `INSERT INTO Usuario (contrasena, nombres, apellidos, correo, telefono, rol) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        pacienteData.contrasena, // Ya debe venir encriptada desde el UseCase
        pacienteData.nombres,
        pacienteData.apellidos,
        pacienteData.correo,
        pacienteData.telefono,
        'PACIENTE',
      ]
    );
    const idUsuario = usuarioResult.insertId;

    // 2. Insert Paciente
    await connection.execute(
      `INSERT INTO Paciente (DNI, fecha_nacimiento, Usuario_idUsuario, ContactoEmergencia_idContactoEmergencia) 
       VALUES (?, ?, ?, ?)`,
      [
        pacienteData.DNI,
        pacienteData.fecha_nacimiento,
        idUsuario,
        null,
      ]
    );

    await connection.commit();
    return {
      success: true,
      idUsuario,
      mensaje: "Paciente registrado correctamente",
    };
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function findUsuarioByCorreo(correo) {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute(
      "SELECT * FROM Usuario WHERE correo = ?",
      [correo]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

module.exports = {
  registerPacienteWithTransaction,
  findUsuarioByCorreo,
};
