const { getConnection } = require("../database/PoolConexion");
const { Usuario } = require("../../domain/entity/Usuario");


async function existsByEmail(email) {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute(
      "SELECT idUsuario FROM Usuario WHERE correo = ?",
      [email],
    );
    return rows.length > 0;
  } finally {
    if (connection) connection.release();
  }
}

async function findUsuariobyEmail(email) {
  let connection;
  try {
    connection = await getConnection();
    const [row] = await connection.execute(
      "SELECT * FROM Usuario WHERE correo = ?",
      [email],
    );

    if (row.length > 0) {
      const userResult = row[0];
      return new Usuario(
        userResult.idUsuario,
        userResult.contrasena,
        userResult.nombres,
        userResult.apellidos,
        userResult.correo,
        userResult.telefono,
        userResult.rol,
      );
    }
    return null;
  } finally {
    if (connection) connection.release();
  }
}

module.exports = {
  existsByEmail,
  findUsuariobyEmail,
};
