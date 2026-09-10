const { getConnection } = require("../database/PoolConexion");

async function createUsuario(connection, usuarioData) {
  const [result] = await connection.execute(
    `INSERT INTO Usuario (contrasena, nombres, apellidos, correo, telefono, rol) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      usuarioData.contrasena,
      usuarioData.nombres,
      usuarioData.apellidos,
      usuarioData.correo,
      usuarioData.telefono,
      usuarioData.rol || 'PACIENTE',
    ]
  );
  return result.insertId;
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
  createUsuario,
  findUsuarioByCorreo,
};
